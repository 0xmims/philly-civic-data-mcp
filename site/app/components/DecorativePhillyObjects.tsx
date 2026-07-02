const props = [
  {
    src: "/assets/philly-props/septa-key-card.png",
    className:
      "right-[5%] top-[20%] hidden w-[18rem] rotate-[10deg] opacity-[0.16] blur-[0.2px] lg:block xl:right-[8%]",
  },
  {
    src: "/assets/philly-props/love-keychain.png",
    className:
      "left-[-2rem] top-[43%] hidden w-[15rem] rotate-[-14deg] opacity-[0.18] blur-[0.15px] lg:block xl:left-[4%]",
  },
  {
    src: "/assets/philly-props/pennsylvania-flag.svg",
    className:
      "right-[-4rem] bottom-[8%] hidden w-[18rem] rotate-[13deg] opacity-[0.12] blur-[0.25px] lg:block xl:right-[10%]",
  },
];

export function DecorativePhillyObjects() {
  return (
    <div
      aria-hidden="true"
      className="decorative-philly-objects pointer-events-none fixed inset-0 z-[1] select-none overflow-hidden"
    >
      {props.map((prop) => (
        <img
          key={prop.src}
          src={prop.src}
          alt=""
          draggable={false}
          className={`philly-prop absolute max-w-none rounded-xl object-contain shadow-luxe ${prop.className}`}
        />
      ))}
    </div>
  );
}
