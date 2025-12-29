import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function LoginBox() {
  const [ok, setOk] = useState(false);
  const { address, isConnected } = useAccount();
  const { connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (!ok) {
    return (
      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <h3>Fake Login</h3>
        <button onClick={() => setOk(true)}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h3>Wallet</h3>
      {isConnected ? (
        <>
          <div>Connected: {address}</div>
          <button onClick={() => disconnect()}>Disconnect</button>
        </>
      ) : (
        <button
          disabled={isPending}
          onClick={async () => {
            await connectAsync({ connector: injected() });
          }}
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
}
