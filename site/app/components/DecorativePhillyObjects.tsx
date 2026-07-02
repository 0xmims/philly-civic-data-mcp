const props = [
  {
    src: "/assets/philly-props/septa-key-card.png",
    className:
      "right-[-1.5rem] top-[16%] hidden w-[13rem] rotate-[9deg] opacity-[0.36] blur-[0.1px] md:block lg:right-[5%] lg:w-[17rem] xl:right-[8%]",
  },
  {
    src: "/assets/philly-props/love-keychain.png",
    className:
      "left-[-4rem] top-[47%] hidden w-[12rem] rotate-[-13deg] opacity-[0.34] blur-[0.1px] md:block lg:left-[-2rem] lg:top-[55%] lg:w-[15rem] xl:left-[3%]",
  },
  {
    src: "/assets/philly-props/pennsylvania-flag.svg",
    className:
      "right-[-5rem] bottom-[7%] hidden w-[15rem] rotate-[13deg] opacity-[0.3] blur-[0.15px] md:block lg:w-[18rem] xl:right-[10%]",
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
          className={`philly-prop absolute max-w-none object-contain ${prop.className}`}
        />
      ))}
    </div>
  );
}
