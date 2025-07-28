import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProjectImage } from "@/lib/types";
import Image from "next/image";

export function ProjectCarousel({ images }: { images: ProjectImage[] }) {
  return (
     <Carousel
      opts={{
        align: "start",
      }}
      className="w-full "
    >
      <CarouselContent className="sm:px-10 ">
        {images.map((image) => (
          <CarouselItem
            key={image.publicId}
            className="basis-auto"
          >
            <div className="sm:p-1 relative w-[calc(100vw-8px)] sm:w-60 h-60 rounded-md overflow-hidden">
              <Image
                src={image.url}
                alt="project image"
                fill
                className="object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-[-8px]" />
      <CarouselNext className="absolute right-[-8px]"/>
    </Carousel>
  );
}
