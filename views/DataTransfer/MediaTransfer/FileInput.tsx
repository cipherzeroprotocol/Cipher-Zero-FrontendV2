"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { convertFileToBase64 } from "@/helpers/data-conversions";
import { InputWithLabel } from "@/views/common/InputWithLabel";
import TextAreaWithLabel from "@/views/common/TextAreaWithLabel";
import MediaSendButton from "./MediaSendButton";
import { useCompression } from "@/hooks/use-compression";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const secretKeyStr =
  "LecBDkkrpWZWiokBwFFWavLWwgUaBDLc4ceAXFiV6VA33oMCdoXqs7mSp38z1Dyjac5pgeaJH2EF4z8ExnrSUgM";

const toSecretKeyStr =
  "3UdKLD8jEYf7V7eWTLbfyTT9xrS6zHn55bgx32zNiMjWzVr56RNehdSvDhKUMyYRUkKmMqASe6oZD54B8svpWpEE";

export default function FileInput() {
  const inputFile = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileSrc, setFileSrc] = useState<string>("");
  const { compressData, decompressData } = useCompression();

  const handleFileUpload = () => {
    inputFile.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const file = e.target.files ? e.target.files[0] : null;
    setFile(file);
  };

  const getFileSizeByMB = (file: File) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(file.size / 1024 ** 2);
  };

  const onCompressFile = async (file: File) => {
    const reader = new FileReader();

    if (file) {
      reader.onload = async () => {
        const data = reader.result as ArrayBuffer;
        console.log(data);

        // const dataBuffer = Buffer.from(data);

        // const message = "Hello, World!";

        // console.log(dataBuffer);

        // const keypairArray = bs58.decode(secretKeyStr);
        // const keypair = Keypair.fromSecretKey(new Uint8Array(keypairArray));

        // const toKeypairArray = bs58.decode(toSecretKeyStr);
        // const toKeypair = Keypair.fromSecretKey(new Uint8Array(toKeypairArray));

        // await compressToken(keypair, toKeypair.publicKey);

        // const compressedData = await compressData(
        //   Buffer.from(message),
        //   keypair,
        //   toKeypair.publicKey
        // );

        // const decompressedData = await decompressData(
        //   compressedData,
        //   toKeypair
        // );

        // console.log(decompressedData);

        const base64Data = await convertFileToBase64(file);
        setFileSrc(base64Data);
      };

      reader.readAsArrayBuffer(file);
    }
  };

  useEffect(() => {
    if (file) {
      onCompressFile(file);
    }
  }, [file]);

  return (
    <div className="flex flex-col gap-8 ">
      <div className="cursor-pointer mt-6" onClick={handleFileUpload}>
        <Image
          src="/images/file-choose-bg.png"
          alt="file-choose"
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          width={0}
          height={0}
        />
        {/* <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div>
          <p className="font-semibold text-lg text-gray-600 dark:text-gray-400">
            Drag and drop files here or{" "}
            <span className="text-primary underline">click to upload</span>
          </p>
        </div> */}
        <input
          type="file"
          ref={inputFile}
          className="invisible"
          onChange={handleFileChange}
        />
      </div>
      {file && (
        <div className="border rounded-lg mt-2 flex items-center px-3 py-2 gap-2">
          {fileSrc ? (
            <Dialog>
              <DialogTrigger>
                <Image src={fileSrc} alt="File" width={64} height={64} />
              </DialogTrigger>
              <DialogContent className="h-screen max-w-screen-sm">
                <div className="p-4">
                  <Image
                    width={0}
                    height={0}
                    src={fileSrc}
                    alt="File"
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              No preview available
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>{file.name}</strong> is selected ({getFileSizeByMB(file)}{" "}
            MB)
          </p>
        </div>
      )}

      <InputWithLabel
        id="recipientAddress"
        label="Recipient's address"
        type="text"
        placeholder="Enter the recipient's address"
      />
      <TextAreaWithLabel id="note" label="Note" placeholder="Write a note..." />
      <MediaSendButton />
    </div>
  );
}
