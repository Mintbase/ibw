"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useFeed, useFirstToken } from "@/hooks/useFeed";
import { DynamicGrid } from "@/components/DynamicGrid";
import React, { useEffect, useRef, useState } from "react";
import { constants } from "@/constants";
import Link from "next/link";

import { getCachedImage } from "@/utils/cachedImage";
import Image from "next/image";
import { ImageCacheProvider, useImageCache } from "@/data/ImageCacheContext";


function transformArweaveToNextJsImage(arweaveUrl: string) {
  // Get the dynamic base URL of your Next.js application
  const nextJsBaseUrl = window.location.origin;

  // Encode the Arweave URL for the 'url' query parameter
  const encodedArweaveUrl = encodeURIComponent(arweaveUrl);

  // Build the Next.js image URL with query parameters
  const nextJsImageUrl = `${nextJsBaseUrl}/_next/image?url=${encodedArweaveUrl}&w=640&q=90`;

  return nextJsImageUrl;
}

const ImageThumb = ({ token, index }:any) => {
  const { cacheImage } = useImageCache();
  const imageUrl = token?.media;

  if (imageUrl) {
    cacheImage(transformArweaveToNextJsImage(imageUrl)); // Cache the image

    return (
      <div className="w-72 h-72 xl:w-80 xl:h-80 relative">
        {/* Render the image */}
        <Image
          src={imageUrl}
          alt={`Token ${index}`}
          className="object-cover h-full w-full"
          width="320"
          height="320"
          quality={90}
          priority={index < 5}
          placeholder="blur"
          blurDataURL={imageUrl}
          
        />
        <button
          className="absolute top-3 right-3 bg-black text-white rounded p-1 text-xs px-2 py-1.5"
          onClick={(e) => {
            e.preventDefault();
            window.open(
              `https://twitter.com/intent/tweet?url=%0aCheck%20out%20mine%3A%20${constants.mintbaseBaseUrl}/meta/${token?.metadata_id}%2F&via=mintbase&text=${constants.twitterText}`,
              '_blank'
            );
          }}
        >
          Share
        </button>
      </div>
    );
  } else {
    return null;
  }
};

const MemoizedImageThumb = React.memo(ImageThumb)


export const HomeComponent = () => {
  return (
    <ImageCacheProvider>
      <HomePage />
    </ImageCacheProvider>
  );
};

export const HomePage = () => {
  const [items, setItems] = useState<any>(null);

  const searchParams = useSearchParams();

  const hasAccountID = searchParams.get("account_id");
  const { push } = useRouter();

  // if(hasAccountID) push('/camera')

  const { isLoading, isFetching, data } = useFeed({
    accountId: constants.proxyContractAddress,
    contractAddress: constants.tokenContractAddress,
  });

  const isReady = !isFetching;
  // if (isReady && data[0]?.media && !items) {
  //   setItems(data);
  // }

  const lists = Array.from(Array(23).keys());

  const { newToken, refetchToken, blockedNfts } = useFirstToken();
  // Create refs to keep track of previous values
  const prevNewToken = useRef(newToken);
  const prevData = useRef(data);

  console.log("loading", isLoading, data, newToken);

  // useEffect(() => {
  //   // Check if both newToken and data are different from their previous values
  //   if (newToken !== prevNewToken.current && data !== prevData.current) {
  //     // Both newToken and data have changed, update the UI or take action here

  //     // Update the refs to store the current values
  //     prevNewToken.current = newToken;
  //     prevData.current = data;
  //   }
  // }, [newToken, data, isLoading]);

  const blockedMedia = blockedNfts as string[];

  const firstTokenisBlocked =
    newToken?.metadata_id && blockedNfts?.includes(newToken?.metadata_id);

  // return null

  return (
    <>
      <main className="px-4 lg:px-12 mx-auto flex flex-col items-center justify-center space-y-4">
        <DynamicGrid mdCols={2} nColsXl={4} nColsXXl={6}>
          {!newToken?.media ? (
            <div
              className="aspect-square rounded overflow-x-hidden cursor-pointer storeImg"
              key={1}
            >
              <div className="rounded animate-pulse w-full h-full bg-gray-600 dark:bg-gray-800" />
            </div>
          ) : !firstTokenisBlocked ||
            typeof firstTokenisBlocked == "undefined" ? (
            <ImageThumb key={newToken?.media} token={newToken} index={1} />
          ) : null}

          {!items && isLoading
            ? lists?.map((listItem) => {
                return (
                  <div
                    className="aspect-square rounded overflow-x-hidden cursor-pointer storeImg"
                    key={listItem}
                  >
                    <div className="rounded animate-pulse w-full h-full bg-gray-600 dark:bg-gray-800" />
                  </div>
                );
              })
            : data?.map((token: any, index: number) => {
                if (
                  !!blockedMedia &&
                  blockedMedia.includes(token?.metadata_id)
                ) {
                  return null;
                }

                return (
                  <MemoizedImageThumb
                    key={token?.metadata_id}
                    token={token}
                    index={index}
                  />
                );
              })}
        </DynamicGrid>
      </main>
    </>
  );
};
