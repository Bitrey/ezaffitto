import * as React from "react";
import Image from "next/image";

const AppHeader = () => (
  <header className="w-full min-h-[6rem] flex justify-around items-center bg-gray-50 text-gray-900">
    <div className="flex justify-center gap-4 items-center">
      <Image alt="Logo" width={56} height={56} src="/images/debug-logo.png" />
      <h1 className="text-red-600 font-semibold text-3xl tracking-tighter">
        ezaffitto
      </h1>
    </div>
    <div className="hidden md:block" />
    <div className="flex justify-center items-center gap-4">
      {/* <Textbox
                className="border-gray-50"
                type="text"
                placeholder="Cerca..."
            /> */}
      <p>Account</p>
    </div>
  </header>
);

export default AppHeader;
