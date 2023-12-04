"use client";
import { useApp } from "@/providers/app";
import { useMbWallet } from "@mintbase-js/react";
import { usePathname, useRouter } from "next/navigation";
import InlineSVG from "react-inlinesvg";

const Header = () => {
  const pathname = usePathname();
  const { isConnected, selector, connect } = useMbWallet();
  const { push } = useRouter();
  const { openModal } = useApp();

  const handleSignout = async () => {
    const wallet = await selector.wallet();
    return wallet.signOut();
  };

  const handleSignIn = async () => {
    return connect();
  };

  const headerButtonsNotHome = (onClick: any) => (
    <div className="flex w-full justify-between px-4 lg:px-12 items-center">
      <button className="h-8 w-8 text-headerText" onClick={onClick}>
        <InlineSVG
          src="/images/arrow_back.svg"
          className="fill-current text-headerText"
        />
      </button>
      <div className="flex gap-4">
        {!isConnected ? (
          <button onClick={() => openModal("default")}>About</button>
        ) : null}

        {isConnected ? (
          <button onClick={handleSignout}> Logout</button>
        ) : (
          <button onClick={handleSignIn}> Login</button>
        )}
        <button onClick={() => push("/leaderboard")}>Leaderboard</button>
      </div>
    </div>
  );

  const renderHeaderButtons = () => {
    switch (pathname) {
      case "/":
        return (
          <div className="flex w-full justify-between px-4 lg:px-12 items-center">
            <div>
              <button className="font-bold text-xl" onClick={() => push("/")}>
                <InlineSVG
                  src="/images/ibw_logo.svg"
                  className="hidden md:block"
                />
                <InlineSVG
                  src="/images/small_ibw_logo.svg"
                  className="md:hidden"
                />
              </button>
            </div>
            <div className="flex gap-4">
              {!isConnected ? (
                <button onClick={() => openModal("default")}>About</button>
              ) : null}

              {isConnected ? (
                <button onClick={handleSignout}> Logout</button>
              ) : (
                <button onClick={handleSignIn}> Login</button>
              )}
              <button onClick={() => push("/leaderboard")}>Leaderboard</button>
            </div>
          </div>
        );
      case "/leaderboard":
        return headerButtonsNotHome(() => push("/"));
      case "/camera":
        return headerButtonsNotHome(() => push("/"));
      default:
        return headerButtonsNotHome(() => push("/"));
    }
  };

  return (
    <>
      <header className="fixed left-0 top-0 flex w-full justify-center py-2 bg-primary text-headerText header-border-gradient border-b">
        {renderHeaderButtons()}
      </header>
    </>
  );
};

export default Header;
