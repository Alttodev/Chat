import "./App.css";
import { ThemeSync } from "@/components/ThemeSync";
import AppRoutes from "./routes/AppRoutes";

import IncomingCallPopup from "./components/Message/IncomingCallPopup";

import { useWebRTC } from "./lib/webRTC";
import VideoCallScreen from "./components/Message/VideoScreen";
import CallingScreen from "./components/Message/CallingScreen";
import CallScreen from "./components/Message/CallScreen";
import BusyScreen from "./components/Message/BusyScreen";

function App() {
  const {
    callState,
    endCall,
    incomingCall,
    outgoingCall,
    activeCall,
    isVideoCall,
  } = useWebRTC();

  return (
    <>
      <ThemeSync />

      {/* INCOMING CALL POPUP */}
      <IncomingCallPopup name={incomingCall?.callerName} />

      {callState === "in_call" && isVideoCall && (
        <VideoCallScreen onEnd={endCall} />
      )}
      {/* OUTGOING CALL SCREEN */}
      {callState === "calling" && (
        <CallingScreen
          onCancel={endCall}
          name={outgoingCall?.callerName || "Unknown"}
          image={outgoingCall?.callerImage}
        />
      )}
      {/* ACTIVE CALL SCREEN */}
      {callState === "in_call" && !isVideoCall && (
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
