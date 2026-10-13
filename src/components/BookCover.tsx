import Image from "next/image";
import { BOOK } from "@/config";

export function BookCover({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={BOOK.coverImage}
      alt="Computational Sovereignty book cover"
      width={2036}
      height={3125}
      priority={priority}
      className={`rounded-md ring-1 ring-hairline shadow-2xl shadow-black/50 ${className}`}
    />
  );
}


export default BookCover;
