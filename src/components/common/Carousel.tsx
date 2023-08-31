import Image from "next/image";
import {
  type RefObject,
  useRef,
  useEffect,
  useState,
  useMemo,
  FC,
} from "react";

interface CarouselProps {
  images: string[];
}

/**
 * @brief A simple carousel component
 * @warning This component is not for production use
 */
const Carousel: FC<CarouselProps> = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const refs: RefObject<HTMLImageElement>[] = useMemo(() => [], []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const image of images) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    refs.push(useRef<HTMLImageElement>(null));
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, intersectionRatio }) => {
          // find the visible image and set it as current
          if (intersectionRatio > 0.25) {
            const index = refs.findIndex((ref) => ref.current === target);
            setCurrent(index);
          }
        });
      },
      { threshold: 0.25 }
    );
    refs.forEach((ref) => {
      if (ref.current != null) {
        observer.observe(ref.current);
      }
    });
    return () => {
      observer.disconnect();
    };
  }, [refs]);
  return (
    <div className="relative flex flex-col gap-4">
      <div className="flex snap-x snap-mandatory gap-4 overflow-auto">
        {images.map((image, index) => (
          <Image
            key={image + index}
            src={image}
            ref={refs[index]}
            alt="image"
            width={150}
            height={150}
            className="h-72 w-full flex-shrink-0 snap-center rounded-xl object-cover"
          />
        ))}
      </div>
      <div className="absolute bottom-3 flex w-full items-center justify-center gap-2">
        {images.length > 1 &&
          images.map((_, index) => (
            <div
              key={index}
              className={`${
                current === index ? "h-3 w-3" : "h-2 w-2"
              } cursor-pointer rounded-full bg-neutral-200 hover:bg-neutral-300`}
            />
          ))}
      </div>
    </div>
  );
};

export default Carousel;
