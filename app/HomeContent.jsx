"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FaArrowRightLong } from "react-icons/fa6";
import { Suspense } from "react";

export default function Home() {
  const router = useRouter();
  const params = useSearchParams();
  const showDescription = Boolean(
    params.get("showDescription") === "true" ? true : false
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="p-5 grid grid-cols-1 lg:grid-cols-3">
        <div className="hidden lg:block col-span-1"></div>
        <div className="col-span-1">
          <p className="text-lg mb-1">
            Below are 3 different versions of medication search.
          </p>
          <p className="text-md mb-3">Please select one to try it out.</p>
          <div
            className="border-solid border border-gray-300 rounded-md py-2 px-3 mt-3 cursor-pointer hover:bg-gray-50 font-medium"
            onClick={() => router.push("/search-1")}
          >
            <div className="inline-block">
              Search 1{showDescription ? ": Medispan" : null}
            </div>
            <div className="inline-block float-right mt-1">
              <FaArrowRightLong />
            </div>
          </div>
          <div
            className="border-solid border border-gray-300 rounded-md py-2 px-3 mt-2 cursor-pointer hover:bg-gray-50 font-medium"
            onClick={() => router.push("/search-2")}
          >
            <div className="inline-block">
              Search 2{showDescription ? ": RxNorm" : null}
            </div>
            <div className="inline-block float-right mt-1">
              <FaArrowRightLong />
            </div>
          </div>
          <div
            className="border-solid border border-gray-300 rounded-md py-2 px-3 mt-2 cursor-pointer hover:bg-gray-50 font-medium"
            onClick={() => router.push("/search-3")}
          >
            <div className="inline-block">
              Search 3{showDescription ? ": DoseSpot-ish" : null}
            </div>
            <div className="inline-block float-right mt-1">
              <FaArrowRightLong />
            </div>
          </div>
          {showDescription ? (
            <div className="mt-5">
              <a
                href="https://austinkleon.com/2024/01/30/snails-and-magical-thinking/"
                target={`_blank`}
                className="text-blue-500 underline"
              >
                {`Is this what you're searching for?`}
              </a>
            </div>
          ) : null}
        </div>
        <div className="hidden lg:block col-span-1"></div>
      </div>
    </Suspense>
  );
}
