import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import App from './App'
import { LibraryGamePage } from './Pages/librarygame/LibraryGamePage'
import { MovingTargetInfoPage } from './Pages/gameinfo/movingtarget_info/movingTarget_info'

import { ContinuousTrackingInfoPage } from './Pages/gameinfo/continuous_tracking_info/ContinuousTracking_info'
import { PredictionInterceptInfoPage } from './Pages/gameinfo/prediction_intercept_info/PredictionIntercept_info'

import { DualTaskInfoPage } from './Pages/gameinfo/dualtask_info/dualTask_info'
import { SpeedLogicInfoPage } from './Pages/gameinfo/speedlogic_info/speedlogic_info'

import MovingTargetGamePage from './Pages/gamepages/movingtarget/movingTarget'
import DualTaskGamePage from './Pages/gamepages/dualtask/dualtask'
import DualTaskResultPage from './Pages/gamepages/dualtask/dualtaskResult'
import SpeedLogicGamePage from './Pages/gamepages/speedlogic/speedLogic'
import SpeedLogicResultPage from './Pages/gamepages/speedlogic/speedLogicResult'
import ContinuousTrackingGamePage from './Pages/gamepages/continuous_tracking/ContinuousTrackingGame'
import PredictionInterceptGamePage from './Pages/gamepages/prediction_intercept/PredictionInterceptGame'

import { NumberSearchInfoPage } from './Pages/gameinfo/numbersearch_info/numberSearch_info'
import NumberSearchGamePage from './Pages/gamepages/numbersearch/numberSearch'

import { SprayControlInfoPage } from './Pages/gameinfo/spray_control_info/SprayControl_info'
import SprayControlGamePage from './Pages/gamepages/spray_control/SprayControlGame'
import { AuditoryLocalizationInfoPage } from './Pages/gameinfo/auditory_localization_info/AuditoryLocalization_info'
import AuditoryLocalizationGamePage from './Pages/gamepages/auditory_localization/AuditoryLocalizationGame'

import { FlashMindInfoPage } from './Pages/gameinfo/flashmind_info/flashMind_info'
import FlashMindGamePage from './Pages/gamepages/flashmind/flashMind'

import { QuickDecisionInfoPage } from './Pages/gameinfo/quickdecision_info/quickDecision_info'
import QuickDecisionGamePage from './Pages/gamepages/quickdecision/quickDecision'

import { ReverseMindInfoPage } from './Pages/gameinfo/reversemind_info/reverseMind_info'
import ReverseMindGamePage from './Pages/gamepages/reversemind/reverseMind'

import { StroopTestInfoPage } from './Pages/gameinfo/strooptest_info/stroopTest_info'
import StroopTestGamePage from './Pages/gamepages/strooptest/stroopTest'

import { SequenceMemoryInfoPage } from './Pages/gameinfo/sequencememory_info/sequenceMemory_info'
import SequenceMemoryGamePage from './Pages/gamepages/sequencememory/sequenceMemory'

import { TraceMemoryInfoPage } from './Pages/gameinfo/tracememory_info/traceMemory_info'
import TraceMemoryGamePage from './Pages/gamepages/tracememory/traceMemory'

import { ColorReflexInfoPage } from './Pages/gameinfo/colorreflex_info/colorReflex_info'
import ColorReflexGamePage from './Pages/gamepages/colorreflex/colorReflex'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/librarygame" element={<LibraryGamePage />} />
        <Route path="/gameinfo/movingtarget" element={<MovingTargetInfoPage />} />
        <Route path="/gameplay/movingtarget" element={<MovingTargetGamePage />} />

        <Route path="/gameinfo/continuous-tracking" element={<ContinuousTrackingInfoPage />} />
        <Route path="/gameplay/continuous-tracking" element={<ContinuousTrackingGamePage />} />

        <Route path="/gameinfo/prediction-intercept" element={<PredictionInterceptInfoPage />} />
        <Route path="/gameplay/prediction-intercept" element={<PredictionInterceptGamePage />} />

        <Route path="/gameinfo/dualtask" element={<DualTaskInfoPage />} />
        <Route path="/gameplay/dualtask" element={<DualTaskGamePage />} />
        <Route path="/gameplay/dualtask/result" element={<DualTaskResultPage />} />
        
        <Route path="/gameinfo/speedlogic" element={<SpeedLogicInfoPage />} />
        <Route path="/gameplay/speedlogic" element={<SpeedLogicGamePage />} />
        <Route path="/gameplay/speedlogic/result" element={<SpeedLogicResultPage />} />

        <Route path="/gameinfo/numbersearch" element={<NumberSearchInfoPage />} />
        <Route path="/gameplay/numbersearch" element={<NumberSearchGamePage />} />

        <Route path="/gameinfo/spray-control" element={<SprayControlInfoPage />} />
        <Route path="/gameplay/spray-control" element={<SprayControlGamePage />} />

        <Route path="/gameinfo/auditory-localization" element={<AuditoryLocalizationInfoPage />} />
        <Route path="/gameplay/auditory-localization" element={<AuditoryLocalizationGamePage />} />

        <Route path="/gameinfo/flashmind" element={<FlashMindInfoPage />} />
        <Route path="/gameplay/flashmind" element={<FlashMindGamePage />} />

        <Route path="/gameinfo/quickdecision" element={<QuickDecisionInfoPage />} />
        <Route path="/gameplay/quickdecision" element={<QuickDecisionGamePage />} />

        <Route path="/gameinfo/reversemind" element={<ReverseMindInfoPage />} />
        <Route path="/gameplay/reversemind" element={<ReverseMindGamePage />} />

        <Route path="/gameinfo/strooptest" element={<StroopTestInfoPage />} />
        <Route path="/gameplay/strooptest" element={<StroopTestGamePage />} />

        <Route path="/gameinfo/sequencememory" element={<SequenceMemoryInfoPage />} />
        <Route path="/gameplay/sequencememory" element={<SequenceMemoryGamePage />} />

        <Route path="/gameinfo/tracememory" element={<TraceMemoryInfoPage />} />
        <Route path="/gameplay/tracememory" element={<TraceMemoryGamePage />} />

        <Route path="/gameinfo/colorreflex" element={<ColorReflexInfoPage />} />
        <Route path="/gameplay/colorreflex" element={<ColorReflexGamePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
