import styles from "@/styles/grid.module.css";

/** Fixed full-viewport grid overlay — server-renderable, no JS needed. */
export default function GridBg() {
  return <div className={styles.gridBg} aria-hidden="true" />;
}
