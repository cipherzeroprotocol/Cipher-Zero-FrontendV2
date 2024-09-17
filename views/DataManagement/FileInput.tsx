"use client";

import useZkCompression from "@/hooks/useZkCompression";
import { UploadIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import crypto from "crypto-js";
import pako from "pako";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { convertFileToBase64 } from "@/helpers/data-conversions";

const encryptionKey = "ab!k@Lr";

export default function FileInput() {
  const inputFile = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileSrc, setFileSrc] = useState<string>("");
  const { createConnection } = useZkCompression();

  const handleFileUpload = () => {
    inputFile.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const file = e.target.files ? e.target.files[0] : null;
    setFile(file);
  };

  const compressData = (data: string) => {
    const compressedData = pako.deflate(data);
    return compressedData;
  };

  const encrypData = async (data: string) => {
    return crypto.AES.encrypt(data, encryptionKey).toString();
  };

  const decryptData = async (data: string): Promise<string | null> => {
    try {
      const decryptedData = crypto.AES.decrypt(data, encryptionKey).toString(
        crypto.enc.Utf8
      );
      return decryptedData;
    } catch (error) {
      console.error("Failed to decrypt data:", error);
      return null;
    }
  };

  const getFileSizeByMB = (file: File) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(file.size / 1024 ** 2);
  };

  const onCompressFile = async (file: File) => {
    console.log(file);
    const reader = new FileReader();

    if (file) {
      reader.readAsArrayBuffer(file);
      console.log("File type: ", file.type);

      const base64FileData = await convertFileToBase64(file);
      const encryptedData = await encrypData(base64FileData);

      if (encryptedData) {
        console.log("Encrypted Data: ", encryptedData);
        const compressedData = compressData(encryptedData);
        console.log("Compressed Data: ", compressedData);

        // const compressedDataStr = new TextDecoder().decode(compressedData);

        // generateProof(compressedDataStr);

        const sizeInMB = new Blob([compressedData]).size / 1024 ** 2;
        console.log("Size in MB: ", sizeInMB);

        const decompressedData = pako.inflate(compressedData, {
          to: "string",
        });

        console.log("Decompressed Data: ", decompressedData);

        console.log("Decompressed Data (Base64): ", decompressedData);

        // Decrypt the decompressed data (which should be the encrypted base64 string)
        const decryptedBase64 = await decryptData(decompressedData);
        console.log("Decrypted Data (Base64): ", decryptedBase64);

        setFileSrc(decryptedBase64 || "");
      }
    }
  };

  // const generateFileSrc = async (file: File | null) => {
  //   if (file === null) {
  //     return "";
  //   }
  //   const base64FileData = await convertFileToBase64(file);

  //   if (base64FileData) {
  //     setFileSrc(base64FileData);
  //   }
  // };

  useEffect(() => {
    if (file) {
      onCompressFile(file);
      // generateFileSrc(file);
    }
  }, [file]);

  useEffect(() => {
    createConnection();
  }, []);

  return (
    <>
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center"
        onClick={handleFileUpload}
      >
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Drag and drop files here or click to upload
        </p>
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
              <DialogContent className="bg-white min-w-full">
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
    </>
  );
}
