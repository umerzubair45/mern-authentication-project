import { createContext, useContext, useState } from "react";

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const [activeCall, setActiveCall] = useState(null);

  /*
   activeCall structure:

   {
     callId,
     callerId,
     receiverId,
     role: "caller" | "receiver",
   }
  */

  const clearActiveCall = () => {
    console.log("🧹 CallContext: clearing activeCall");
    setActiveCall(null);
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        setActiveCall,
        clearActiveCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error("useCall must be used inside CallProvider");
  }

  return context;
};

export default CallContext;
