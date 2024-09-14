import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useSentDataManagementLogic from "./SentDataManagement.logic";
import { sentFiles } from "./SentDataManagement.mock";

export default function SentDataManagement() {
  const { getStatusColor } = useSentDataManagementLogic();

  return (
    <div className="overflow-x-auto border px-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">File Name</TableHead>
            <TableHead className="text-left">Sent To</TableHead>
            <TableHead className="text-left">Size</TableHead>
            <TableHead className="text-left">Timestamp</TableHead>
            <TableHead className="text-left">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sentFiles.map((file, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{file.fileName}</TableCell>
              <TableCell>{file.recipient}</TableCell>
              <TableCell>{file.size}</TableCell>
              <TableCell>{file.timestamp}</TableCell>
              <TableCell>
                <span className={getStatusColor(file.status)}>
                  {file.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
