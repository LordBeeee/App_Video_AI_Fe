import { useLayoutEffect, useMemo, useRef } from "react";

const MENTION_PATTERN = /@(image|video|element)_\d+/g;
const DRAG_TYPE = "application/x-kling-mention";

function plainText(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
  if (node.nodeType === Node.ELEMENT_NODE && node.dataset?.mention) return node.dataset.mention;
  if (node.nodeName === "BR") return "\n";
  return Array.from(node.childNodes).map(plainText).join("");
}

function normalizeEmptyPrompt(text) {
  return text.replace(/[\s\u200B-\u200D\uFEFF]/g, "") ? text : "";
}

function mentionChip(mention, asset) {
  const chip = document.createElement("span");
  chip.className = "st-prompt-mention";
  chip.contentEditable = "false";
  chip.dataset.mention = mention;
  chip.title = asset.label || mention;
  if (asset.kind === "video") {
    const preview = document.createElement("video");
    preview.src = asset.url;
    preview.muted = true;
    preview.preload = "metadata";
    chip.append(preview);
  } else {
    const preview = document.createElement("img");
    preview.src = asset.url;
    preview.alt = "";
    chip.append(preview);
  }
  const text = document.createElement("span");
  text.textContent = mention;
  chip.append(text);
  return chip;
}

export default function MentionPrompt({ value, onChange, assets, maxLength, placeholder, rows = 8, onFocus, ariaLabel }) {
  const editor = useRef(null);
  const lastAssets = useRef("");
  const assetKey = JSON.stringify(assets.map(({ mention, url, kind }) => [mention, url, kind]));
  const assetMap = useMemo(() => new Map(assets.map((asset) => [asset.mention, asset])), [assets]);

  const renderValue = (text) => {
    const root = editor.current;
    if (!root) return;
    const nodes = [];
    let cursor = 0;
    for (const match of text.matchAll(MENTION_PATTERN)) {
      if (match.index > cursor) nodes.push(document.createTextNode(text.slice(cursor, match.index)));
      const asset = assetMap.get(match[0]);
      nodes.push(asset ? mentionChip(match[0], asset) : document.createTextNode(match[0]));
      cursor = match.index + match[0].length;
    }
    if (cursor < text.length) nodes.push(document.createTextNode(text.slice(cursor)));
    root.replaceChildren(...nodes);
    lastAssets.current = assetKey;
  };

  useLayoutEffect(() => {
    const normalized = normalizeEmptyPrompt(value);
    if (normalized !== value) {
      onChange(normalized);
    } else if (editor.current && (plainText(editor.current) !== value || lastAssets.current !== assetKey)) {
      renderValue(value);
    }
  });

  const sync = () => {
    const text = normalizeEmptyPrompt(plainText(editor.current));
    if (text.length > maxLength) {
      renderValue(value);
      return;
    }
    if (!text) editor.current.replaceChildren();
    onChange(text);
  };

  const insertText = (text) => {
    const root = editor.current;
    const selection = window.getSelection();
    if (!root || !selection) return;
    const range = selection.rangeCount ? selection.getRangeAt(0) : document.createRange();
    if (!root.contains(range.commonAncestorContainer)) {
      range.selectNodeContents(root);
      range.collapse(false);
    }
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    sync();
  };

  const handleDrop = (event) => {
    const mention = event.dataTransfer.getData(DRAG_TYPE);
    if (!/^@(image|video|element)_\d+$/.test(mention)) return;
    event.preventDefault();
    const root = editor.current;
    const asset = assetMap.get(mention);
    if (!root || !asset) return;
    const pointRange = document.caretRangeFromPoint?.(event.clientX, event.clientY);
    const selection = window.getSelection();
    const range = pointRange && root.contains(pointRange.commonAncestorContainer)
      ? pointRange : selection?.rangeCount ? selection.getRangeAt(0) : document.createRange();
    if (!root.contains(range.commonAncestorContainer)) {
      range.selectNodeContents(root);
      range.collapse(false);
    }
    const beforeRange = range.cloneRange();
    beforeRange.selectNodeContents(root);
    beforeRange.setEnd(range.startContainer, range.startOffset);
    const before = plainText(beforeRange.cloneContents());
    const selected = plainText(range.cloneContents());
    const after = value.slice(before.length + selected.length);
    const leading = before && !/\s$/.test(before) ? " " : "";
    const trailing = !after || !/^\s/.test(after) ? " " : "";
    if (value.length - selected.length + leading.length + mention.length + trailing.length > maxLength) return;
    range.deleteContents();
    const fragment = document.createDocumentFragment();
    if (leading) fragment.append(document.createTextNode(leading));
    const chip = mentionChip(mention, asset);
    fragment.append(chip);
    const tail = trailing ? document.createTextNode(trailing) : chip;
    if (trailing) fragment.append(tail);
    range.insertNode(fragment);
    range.setStartAfter(tail);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    sync();
  };

  return <div ref={editor} className="st-ta st-rich-prompt" contentEditable
    role="textbox" aria-label={ariaLabel} aria-multiline="true" data-placeholder={placeholder}
    style={{ minHeight: `${rows * 1.55}em` }}
    suppressContentEditableWarning onFocus={onFocus} onInput={sync}
    onBlur={() => renderValue(normalizeEmptyPrompt(plainText(editor.current)))}
    onKeyDown={(event) => {
      if (event.key === "Enter") { event.preventDefault(); insertText("\n"); }
    }}
    onPaste={(event) => {
      event.preventDefault();
      insertText(event.clipboardData.getData("text/plain"));
    }}
    onDragOver={(event) => {
      if (event.dataTransfer.types.includes(DRAG_TYPE)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }
    }}
    onDrop={handleDrop} />;
}
