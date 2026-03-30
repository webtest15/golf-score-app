import { useStore } from './store/useStore'
import { HomeScreen } from './components/HomeScreen'
import { RoomScreen } from './components/RoomScreen'
import { Notification } from './components/ui'

export default function App() {
  const screen = useStore((s) => s.screen)

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
          background: #f5f5f5;
          -webkit-font-smoothing: antialiased;
        }

        /* LIVE バッジ */
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        /* カウントダウン数字がポンと出る */
        @keyframes cdPop {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1);   opacity: 1; }
        }

        /* カードが下からスライドイン */
        @keyframes slideInFromBottom {
          0%   { transform: translateY(48px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }

        /* 1位カードのドーン演出 */
        @keyframes winnerPop {
          0%   { transform: scale(0.88); opacity: 0.4; }
          55%  { transform: scale(1.04); }
          80%  { transform: scale(0.98); }
          100% { transform: scale(1);    opacity: 1; }
        }

        /* 順位変動バッジのフラッシュ */
        @keyframes deltaFlash {
          0%   { transform: scale(1.7); opacity: 0.5; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }

        /* プレースホルダーの点滅 */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }

        /* スライダー */
        input[type=range] {
          -webkit-appearance: none;
          height: 4px;
          border-radius: 2px;
          background: #e0e0e0;
          outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #1D9E75;
          cursor: pointer;
        }

        button:active { opacity: 0.82; }
        ::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
      `}</style>
      <Notification />
      {screen === 'home' && <HomeScreen />}
      {screen === 'room' && <RoomScreen />}
    </>
  )
}
