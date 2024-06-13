"use client";

import { useRouter } from "next/navigation";
import { FaArrowRightLong } from "react-icons/fa6";

export default function Home() {
  const router = useRouter();

  return (
    <div className="p-5 grid grid-cols-3">
      <div className="col-span-1"></div>
      <div className="col-span-1">
        <p className="text-lg mb-1">
          Below are 3 different versions of medication search.
        </p>
        <p className="text-md mb-3">Please select one to try it out.</p>
        <div
          class="border-solid border border-gray-300 rounded-md py-2 px-3 mt-3  cursor-pointer hover:bg-gray-50 font-medium"
          onClick={() => router.push("/search-1")}
        >
          <div className="inline-block">Search 1: Medispan</div>
          <div className="inline-block float-right mt-1">
            <FaArrowRightLong />
          </div>
        </div>
        <div
          class="border-solid border border-gray-300 rounded-md py-2 px-3 mt-2  cursor-pointer hover:bg-gray-50 font-medium"
          onClick={() => router.push("/search-2")}
        >
          <div className="inline-block">Search 2: RxNorm</div>
          <div className="inline-block float-right mt-1">
            <FaArrowRightLong />
          </div>
        </div>
        <div
          class="border-solid border border-gray-300 rounded-md py-2 px-3 mt-2  cursor-pointer hover:bg-gray-50 font-medium"
          onClick={() => router.push("/search-3")}
        >
          <div className="inline-block">Search 3: DoseSpot-ish</div>
          <div className="inline-block float-right mt-1">
            <FaArrowRightLong />
          </div>
        </div>
      </div>
      <div className="col-span-1"></div>
    </div>
  );
}
