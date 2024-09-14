import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useReceivedFilesManagementLogic from "./ReceivedFilesManagement.logic";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import TableFromCell from "./TableFromCell";

export default function ReceivedFilesManagement() {
  const { receivedFileList } = useReceivedFilesManagementLogic();

  return (
    <div className="overflow-x-auto border px-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">File Name</TableHead>
            <TableHead className="text-left">From</TableHead>
            <TableHead className="text-left">Size</TableHead>
            <TableHead className="text-left">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receivedFileList.map((file, index) => (
            <TableRow key={index} className="py-4">
              <TableCell className="font-medium">
                {file.fileName}.{file.fileExtension}
              </TableCell>
              <TableCell className="text-gray-500">
                <TableFromCell value={file.from} />
              </TableCell>
              <TableCell>{file.fileSize}</TableCell>
              <TableCell>
                <Button size="sm">Preview</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
