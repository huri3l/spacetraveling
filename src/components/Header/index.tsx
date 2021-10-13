import { ReactElement } from 'react';
import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): ReactElement {
  return (
    <header className={styles.headerContainer}>
      <div className={`${styles.headerContent} ${commonStyles.contentWidth}`}>
        <Link href="/">
          <img src="/logo.svg" alt="logo" />
        </Link>
      </div>
    </header>
  );
}
