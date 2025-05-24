"use client";
import useOutsideClick from "@hooks/use-outside-click";
import {
    IconArrowNarrowLeft,
    IconArrowNarrowRight,
    IconX,
} from "@tabler/icons-react";
import { colors } from "@utils/constants";
import { MapCard, MapData } from "@utils/types";
import { getRandomItem } from "@utils/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, {
    useEffect,
    useRef,
    useState,
    createContext,
    useContext,
    JSX,
} from "react";
import { cn } from "src/lib/utils";

interface CarouselProps {
    items: JSX.Element[];
    initialScroll?: number;
}

type CardProps = {
    card: MapCard;
    index: number;
    mapName: string;
    modalContent: (
        card: MapCard,
        mapName: string,
        onSelect: (data: MapData) => void,
    ) => JSX.Element;
    onSelect: (data: MapData) => void;
    layout?: boolean;
};

const COLOR = getRandomItem(colors);

export const CarouselContext = createContext<{
    onCardClose: (index: number) => void;
    currentIndex: number;
}>({
    onCardClose: () => undefined,
    currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
    const carouselRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (carouselRef.current) {
            carouselRef.current.scrollLeft = initialScroll;
            checkScrollability();
        }
    }, [initialScroll]);

    const checkScrollability = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } =
                carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
        }
    };

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
    };

    const handleCardClose = (index: number) => {
        if (carouselRef.current) {
            const cardWidth = isMobile() ? 230 : 384; // (md:w-96)
            const gap = isMobile() ? 4 : 8;
            const scrollPosition = (cardWidth + gap) * (index + 1);
            carouselRef.current.scrollTo({
                left: scrollPosition,
                behavior: "smooth",
            });
            setCurrentIndex(index);
        }
    };

    const isMobile = () => {
        return window && window.innerWidth < 768;
    };

    return (
        <CarouselContext.Provider
            value={{ onCardClose: handleCardClose, currentIndex }}
        >
            <div className="relative w-full">
                <div
                    className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-12"
                    ref={carouselRef}
                    onScroll={checkScrollability}
                >
                    <div
                        className={cn(
                            "absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l",
                        )}
                    ></div>

                    <div
                        className={cn(
                            "flex flex-row justify-start gap-4 pl-4",
                            "mx-auto max-w-7xl", // remove max-w-4xl if you want the carousel to span the full width of its container
                        )}
                    >
                        {items.map((item, index) => (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 20,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: 0.5,
                                        delay: 0.2 * index,
                                        ease: "easeOut",
                                        once: true,
                                    },
                                }}
                                key={`card-${index}`}
                                className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
                            >
                                {item}
                            </motion.div>
                        ))}
                    </div>
                </div>
                {items.length > 3 && (
                    <div className="mr-10 flex justify-end gap-2">
                        <button
                            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
                            onClick={scrollLeft}
                            disabled={!canScrollLeft}
                        >
                            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
                        </button>
                        <button
                            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
                            onClick={scrollRight}
                            disabled={!canScrollRight}
                        >
                            <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>
                )}
            </div>
        </CarouselContext.Provider>
    );
};

export const Card = ({
    card,
    index,
    mapName,
    modalContent,
    onSelect,
    layout = false,
}: CardProps) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { onCardClose } = useContext(CarouselContext);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                handleClose();
            }
        }

        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    useOutsideClick(containerRef, () => handleClose());

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        onCardClose(index);
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-50 h-screen overflow-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
                        />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            ref={containerRef}
                            layoutId={layout ? `card-${card.title}` : undefined}
                            className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl bg-white p-4 font-sans md:p-10 dark:bg-neutral-900"
                        >
                            <button
                                className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white"
                                onClick={handleClose}
                            >
                                <IconX className="h-6 w-6 text-neutral-100 dark:text-neutral-900" />
                            </button>
                            <motion.p
                                layoutId={
                                    layout ? `title-${card.title}` : undefined
                                }
                                className="mt-4 font-semibold text-2xl text-neutral-700 md:text-5xl dark:text-white"
                            >
                                {card.title}
                            </motion.p>
                            {modalContent(card, mapName, onSelect)}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <motion.button
                layoutId={layout ? `card-${card.title}` : undefined}
                onClick={handleOpen}
                disabled={!card.src}
                className="relative z-10 flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-100 md:h-[30rem] md:w-80 dark:bg-neutral-900"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/50 via-transparent to-transparent" />
                <div className="relative z-40 p-8">
                    <motion.p
                        layoutId={layout ? `title-${card.title}` : undefined}
                        className="mt-2 max-w-xs text-left font-sans font-semibold text-white text-xl [text-wrap:balance] md:text-3xl"
                    >
                        {card.title}
                    </motion.p>
                </div>
                {card.src ? (
                    <BlurImage
                        src={card.src}
                        alt={card.title}
                        fill
                        className="absolute inset-0 z-10 h-full object-cover"
                    />
                ) : (
                    <div
                        className={"absolute inset-0 z-10 h-full opacity-60"}
                        style={{
                            background: COLOR,
                        }}
                    />
                )}
            </motion.button>
        </>
    );
};

type ImageProps = {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
};

export const BlurImage = ({
    height,
    width,
    src,
    className,
    alt,
    ...rest
}: ImageProps) => {
    const [isLoading, setLoading] = useState(true);
    return (
        <>
            <img
                className={cn(
                    "transition duration-300",
                    isLoading ? "blur-sm" : "blur-0",
                    className,
                )}
                onLoad={() => setLoading(false)}
                src={src}
                width={width}
                height={height}
                loading="lazy"
                decoding="async"
                blurDataURL={typeof src === "string" ? src : undefined}
                alt={alt ?? "Background of a beautiful view"}
                {...rest}
            />
        </>
    );
};

