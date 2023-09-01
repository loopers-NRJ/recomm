import Image from "next/image";
import {
  type RefObject,
  useRef,
  useEffect,
  useState,
  useMemo,
  FC,
} from "react";
import { BiLeftArrow, BiRightArrow } from "react-icons/bi";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const image of images) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    refs.push(useRef<HTMLImageElement>(null));
  }

  const swipeTo = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (scrollContainerRef.current != null) {
      scrollContainerRef.current.scrollTo({
        behavior: "smooth",
        left: refs[index]?.current?.offsetLeft ?? 0,
      });
    }
    setCurrent(index);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, intersectionRatio }) => {
          // find the visible image and set it as current
          if (intersectionRatio > 0.25) {
            const index = refs.findIndex((ref) => ref.current === target);
            setCurrent(index % images.length);
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
  }, [refs, images]);

  return (
    <div className="relative flex flex-col gap-4">
      <button
        className="absolute top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full p-2 disabled:opacity-0"
        onClick={(e) => swipeTo(current - 1, e)}
        disabled={current === 0}
      >
        <BiLeftArrow />
      </button>

      <button
        className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full p-2 disabled:opacity-0"
        onClick={(e) => swipeTo(current + 1, e)}
        disabled={current === images.length - 1}
      >
        <BiRightArrow />
      </button>
      <div
        className="flex snap-x snap-mandatory gap-4 overflow-auto"
        ref={scrollContainerRef}
      >
        {images.map((image, index) => (
          <Image
            key={image + index}
            src={image}
            ref={refs[index]}
            alt="image"
            width={150}
            height={150}
            className="h-72 w-full flex-shrink-0 snap-center snap-always rounded-xl object-cover"
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
              onClick={(e) => swipeTo(index, e)}
            />
          ))}
      </div>
    </div>
  );
};

export default Carousel;
