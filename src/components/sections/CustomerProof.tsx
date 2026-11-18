import styles from "./CustomerProof.module.css";

interface Props {
  /** "card": photo then quote in a white card. "feature": quote then photo with a question over it (home). */
  variant?: "card" | "feature";
}

/** The Mars quote with the team photo. */
export function CustomerProof({ variant = "card" }: Props) {
  const photo = (
    <div className={styles[`photoFrame_${variant}`]}>
      <img
        src="/images/team-photo.jpg"
        alt="Two colleagues reviewing work together on a laptop"
        className={styles[`photo_${variant}`]}
        loading="lazy"
      />
      {variant === "feature" && (
        <div className={styles.question} aria-hidden="true">
          Who on our team already knows Hallex Energy?
        </div>
      )}
    </div>
  );
  const quote = (
    <figure className={styles[`figure_${variant}`]}>
      <blockquote className={styles[`quote_${variant}`]}>
        “There was a pre-Nucla Mars and a post-Nucla Mars. It was nearly impossible to see our relationships
        cross-functionally before you guys came along.”
      </blockquote>
      <figcaption className={styles[`caption_${variant}`]}>
        <img src="/images/mars-logo.png" alt="Mars" className={styles.logo} />
        <span className={styles.role}>Global Innovation &amp; R&amp;D Leader, Mars</span>
      </figcaption>
    </figure>
  );

  return (
    <section className={styles[`section_${variant}`]} aria-label="What customers say">
      {variant === "card" ? (
        <div className={styles.card}>
          <div className={styles.grid_card}>
            {photo}
            {quote}
          </div>
        </div>
      ) : (
        <div className={styles.grid_feature}>
          {quote}
          {photo}
        </div>
      )}
    </section>
  );
}
