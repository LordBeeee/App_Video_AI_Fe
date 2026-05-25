import { useState } from "react";
import SceneAndBrief from "../../components/CreateVideoFlow/Step1/SceneAndBrief";
import Prompt from "../../components/CreateVideoFlow/Step2/Prompt";
import CreateImage from "../../components/CreateVideoFlow/Step3/CreateImage";
import CreateVideo from "../../components/CreateVideoFlow/Step4/CreateVideo";
import Download from "../../components/CreateVideoFlow/Step5/Download";

const STEPS = [
  { number: 1, label: "Scene & Brief",        component: SceneAndBrief },
  { number: 2, label: "Prompt Configuration", component: Prompt        },
  { number: 3, label: "Create Image",         component: CreateImage   },
  { number: 4, label: "Create Video",         component: CreateVideo   },
  { number: 5, label: "Download",             component: Download      },
];

export default function CreateVideoFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sceneData, setSceneData] = useState({
    sceneCount: 3,
    briefs: ["", "", ""],
  });
//   const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  const goNext = (data) => {
    if (data?.sceneCount) {
        setSceneData(data);
    }

    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const progressPercent = (currentStep / STEPS.length) * 100;
  const StepComponent = STEPS[currentStep - 1].component;

  return (
    <main className="pt-16 pl-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-margin py-margin">

        {/* ── Step Header ── */}
        <div className="mb-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="font-label-caps text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full whitespace-nowrap">
              Step {currentStep} of {STEPS.length}
            </span>

            {/* Step dots (desktop) */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {STEPS.map((step) => (
                <div key={step.number} className="flex items-center gap-1 flex-1 last:flex-none">
                  <button
                    onClick={() => setCurrentStep(step.number)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono-ui transition-all
                      ${step.number < currentStep
                        ? "primary-gradient text-white"
                        : step.number === currentStep
                        ? "border-2 border-indigo-400 text-indigo-400"
                        : "bg-white/5 text-white/30"
                      }`}
                  >
                    {step.number < currentStep
                      ? <span className="material-symbols-outlined text-[12px]">check</span>
                      : step.number}
                  </button>
                  {step.number < STEPS.length && (
                    <div className="h-px flex-1 bg-white/10 relative overflow-hidden">
                      {step.number < currentStep && (
                        <div className="absolute inset-0 primary-gradient" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile: linear progress bar */}
            <div className="flex md:hidden h-1 flex-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full primary-gradient transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* ❌ Đã bỏ <h2> label và <p> description — mỗi step tự render */}
        </div>

        {/* ── Active Step Content ── */}
        {/* <StepComponent onNext={goNext} onBack={goBack} currentStep={currentStep} /> */}
        <StepComponent
        onNext={goNext}
        onBack={goBack}
        currentStep={currentStep}
        sceneCount={sceneData.sceneCount}
        briefs={sceneData.briefs}
        />
      </div>
    </main>
  );
}