import { useCallback, useEffect, useRef, useState } from "react";

const COMPLETION_CELEBRATION_VERSES = [
  {
    reference: "2 Chronicles 15:7",
    text: "Be ye strong therefore, and let not your hands be weak: for your work shall be rewarded.",
  },
  {
    reference: "Psalm 55:22",
    text: "Cast thy burden upon the Lord, and he shall sustain thee: he shall never suffer the righteous to be moved.",
  },
  {
    reference: "Proverbs 3:5",
    text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.",
  },
  {
    reference: "Proverbs 3:6",
    text: "In all thy ways acknowledge him, and he shall direct thy paths.",
  },
  {
    reference: "Proverbs 16:3",
    text: "Commit thy works unto the Lord, and thy thoughts shall be established.",
  },
  {
    reference: "Ecclesiastes 9:10",
    text: "Whatsoever thy hand findeth to do, do it with thy might; for there is no work, nor device, nor knowledge, nor wisdom, in the grave, whither thou goest.",
  },
  {
    reference: "Isaiah 40:31",
    text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
  },
  {
    reference: "Isaiah 41:10",
    text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
  },
  {
    reference: "Matthew 11:28",
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
  },
  {
    reference: "Matthew 19:26",
    text: "But Jesus beheld them, and said unto them, With men this is impossible; but with God all things are possible.",
  },
  {
    reference: "Luke 1:37",
    text: "For with God nothing shall be impossible.",
  },
  {
    reference: "Romans 8:28",
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
  },
  {
    reference: "Romans 12:11",
    text: "Not slothful in business; fervent in spirit; serving the Lord;",
  },
  {
    reference: "1 Corinthians 9:24",
    text: "Know ye not that they which run in a race run all, but one receiveth the prize? So run, that ye may obtain.",
  },
  {
    reference: "1 Corinthians 15:58",
    text: "Therefore, my beloved brethren, be ye stedfast, unmoveable, always abounding in the work of the Lord, forasmuch as ye know that your labour is not in vain in the Lord.",
  },
  {
    reference: "2 Timothy 4:7",
    text: "I have fought a good fight, I have finished my course, I have kept the faith:",
  },
  {
    reference: "Ephesians 6:10",
    text: "Finally, my brethren, be strong in the Lord, and in the power of his might.",
  },
  {
    reference: "Philippians 3:14",
    text: "I press toward the mark for the prize of the high calling of God in Christ Jesus.",
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ which strengtheneth me.",
  },
  {
    reference: "Colossians 3:23",
    text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men;",
  },
  {
    reference: "2 Thessalonians 3:13",
    text: "But ye, brethren, be not weary in well doing.",
  },
  {
    reference: "Hebrews 10:23",
    text: "Let us hold fast the profession of our faith without wavering; ( for he is faithful that promised;)",
  },
  {
    reference: "Hebrews 12:1",
    text: "Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us,",
  },
  {
    reference: "Galatians 6:9",
    text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
  },
] satisfies ReadonlyArray<{ reference: string; text: string }>;

export function getReadingCompletionTransition(
  wasComplete: boolean,
  totalChapters: number,
  readChapters: number,
) {
  const isComplete = totalChapters > 0 && readChapters === totalChapters;
  return {
    isComplete,
    shouldCelebrate: isComplete && !wasComplete,
  };
}

type UseCompletionCelebrationParams = {
  totalChapters: number;
  readChapters: number;
};

export function useCompletionCelebration({
  totalChapters,
  readChapters,
}: UseCompletionCelebrationParams) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [verse, setVerse] = useState(COMPLETION_CELEBRATION_VERSES[0]);
  const previousCompletionRef = useRef(false);

  useEffect(() => {
    const transition = getReadingCompletionTransition(
      previousCompletionRef.current,
      totalChapters,
      readChapters,
    );
    previousCompletionRef.current = transition.isComplete;

    if (!transition.shouldCelebrate) {
      return;
    }

    setVerse(
      COMPLETION_CELEBRATION_VERSES[
        Math.floor(Math.random() * COMPLETION_CELEBRATION_VERSES.length)
      ],
    );
    setIsOpen(true);
    setShowConfetti(true);

    const timeoutId = window.setTimeout(() => {
      setShowConfetti(false);
    }, 4200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [readChapters, totalChapters]);

  const onOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setShowConfetti(false);
    }
  }, []);

  return {
    open: isOpen,
    showConfetti,
    verse,
    onOpenChange,
  };
}
