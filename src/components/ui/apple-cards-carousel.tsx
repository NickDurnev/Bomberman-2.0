"use client";
import React, {
    useEffect,
    useRef,
    useState,
    createContext,
    useContext,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    IconArrowNarrowLeft,
    IconArrowNarrowRight,
    IconX,
} from "@tabler/icons-react";
import useOutsideClick from "@hooks/use-outside-click";
import { cn } from "src/lib/utils";
import { getRandomItem } from "@utils/utils";
import { Button } from "@components/index";
import { colors } from "@utils/constants";

interface CarouselProps {
    items: JSX.Element[];
    initialScroll?: number;
}

type Card = {
    title: string;
    maxPlayers?: number;
    description?: string;
    src?: string;
};

type CardProps = {
    card: Card;
    index: number;
    mapName: string;
    onSelect: (mapName: string) => void;
    layout?: boolean;
};

const COLOR = getRandomItem(colors);

export const CarouselContext = createContext<{
    onCardClose: (index: number) => void;
    currentIndex: number;
}>({
    onCardClose: () => {},
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
                    className="flex w-full overflow-x-scroll overscroll-x-auto py-10 md:py-12 scroll-smooth [scrollbar-width:none]"
                    ref={carouselRef}
                    onScroll={checkScrollability}
                >
                    <div
                        className={cn(
                            "absolute right-0  z-[1000] h-auto  w-[5%] overflow-hidden bg-gradient-to-l"
                        )}
                    ></div>

                    <div
                        className={cn(
                            "flex flex-row justify-start gap-4 pl-4",
                            "max-w-7xl mx-auto" // remove max-w-4xl if you want the carousel to span the full width of its container
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
                                key={"card" + index}
                                className="last:pr-[5%] md:last:pr-[33%]  rounded-3xl"
                            >
                                {item}
                            </motion.div>
                        ))}
                    </div>
                </div>
                {items.length > 3 && (
                    <div className="flex justify-end gap-2 mr-10">
                        <button
                            className="relative z-40 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
                            onClick={scrollLeft}
                            disabled={!canScrollLeft}
                        >
                            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
                        </button>
                        <button
                            className="relative z-40 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
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
    onSelect,
    layout = false,
}: CardProps) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { onCardClose, currentIndex } = useContext(CarouselContext);

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
                    <div className="fixed inset-0 h-screen z-50 overflow-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-black/80 backdrop-blur-lg h-full w-full fixed inset-0"
                        />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            ref={containerRef}
                            layoutId={layout ? `card-${card.title}` : undefined}
                            className="max-w-5xl mx-auto bg-white dark:bg-neutral-900 h-fit z-[60] my-10 p-4 md:p-10 rounded-3xl font-sans relative"
                        >
                            <button
                                className="sticky top-4 h-8 w-8 right-0 ml-auto bg-black dark:bg-white rounded-full flex items-center justify-center"
                                onClick={handleClose}
                            >
                                <IconX className="h-6 w-6 text-neutral-100 dark:text-neutral-900" />
                            </button>
                            <motion.p
                                layoutId={
                                    layout ? `title-${card.title}` : undefined
                                }
                                className="text-2xl md:text-5xl font-semibold text-neutral-700 mt-4 dark:text-white"
                            >
                                {card.title}
                            </motion.p>
                            <div className="py-10">
                                <div className="flex flex-col gap-y-5 items-start justify-start bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 text-left rounded-3xl mb-4">
                                    <p className="text-neutral-700 dark:text-neutral-200 text-base md:text-2xl font-bold max-w-3xl">
                                        Players: 1 - {card.maxPlayers}
                                    </p>
                                    <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl">
                                        {card.description}
                                    </p>
                                    <Button
                                        text="Play"
                                        className="mt-4 px-6 py-2 rounded-lg ml-auto mr-[32px]"
                                        onClick={() => onSelect(mapName)}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <motion.button
                layoutId={layout ? `card-${card.title}` : undefined}
                onClick={handleOpen}
                disabled={!card.src}
                className="rounded-3xl bg-gray-100 dark:bg-neutral-900 h-80 w-56 md:h-[30rem] md:w-80 overflow-hidden flex flex-col items-start justify-start relative z-10"
            >
                <div className="absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-30 pointer-events-none" />
                <div className="relative z-40 p-8">
                    <motion.p
                        layoutId={layout ? `title-${card.title}` : undefined}
                        className="text-white text-xl md:text-3xl font-semibold max-w-xs text-left [text-wrap:balance] font-sans mt-2"
                    >
                        {card.title}
                    </motion.p>
                </div>
                {card.src ? (
                    <BlurImage
                        src={card.src}
                        alt={card.title}
                        fill
                        className="object-cover absolute z-10 inset-0 h-full"
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

export const BlurImage = ({
    height,
    width,
    src,
    className,
    alt,
    ...rest
}: any) => {
    const [isLoading, setLoading] = useState(true);
    return (
        <img
            className={cn(
                "transition duration-300",
                isLoading ? "blur-sm" : "blur-0",
                className
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
    );
};

