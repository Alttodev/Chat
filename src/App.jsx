import "./App.css";
import { ThemeSync } from "@/components/ThemeSync";
import AppRoutes from "./routes/AppRoutes";

import IncomingCallPopup from "./components/IncomingCallPopup";
import CallingScreen from "./components/CallingScreen";
import CallScreen from "./components/CallScreen";
import { useWebRTC } from "./lib/webRTC";

function App() {
  const { callState, endCall, incomingCall, outgoingCall, activeCall } =
    useWebRTC();
  console.log(callState,"callState")
  return (
    <>
      <ThemeSync />

      {/* INCOMING CALL POPUP */}
      <IncomingCallPopup name={incomingCall?.callerName} />

      {/* OUTGOING CALL SCREEN */}
      {callState === "calling" && (
        <CallingScreen
          onCancel={endCall}
          name={outgoingCall?.callerName || "Unknown"}
          image={outgoingCall?.callerImage}
        />
      )}
      {/* ACTIVE CALL SCREEN */}
      {callState === "in_call" && (
        <CallScreen
          onEnd={endCall}
          name={activeCall?.callerName || "Unknown"}
          image={activeCall?.callerImage}
        />
      )}

      {callState === "busy" && <BusyScreen name="User" />}

      {/* MAIN APP ROUTES */}
      <AppRoutes />
    </>
  );
}

export default App;
