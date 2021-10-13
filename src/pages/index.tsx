import Prismic from '@prismicio/client';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setPosts(
      postsPagination.results.map(post => ({
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
      }))
    );
    setNextPage(postsPagination.next_page);
  }, [postsPagination.next_page, postsPagination.results]);

  function loadPosts(): void {
    if (currentPage !== 1 && nextPage === null) return;

    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const normalizedPosts = data.results.map(post => ({
          uid: post.uid,
          first_publication_date: format(
            new Date(post.first_publication_date),
            'dd MMM y',
            {
              locale: ptBR,
            }
          ),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        }));

        setPosts([...posts, ...normalizedPosts]);
        setNextPage(data.next_page);
        setCurrentPage(data.page);
      });
  }

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <main className={`${styles.mainWrapper} ${commonStyles.contentWidth}`}>
        <ul className={`${styles.listContainer} ${commonStyles.contentWidth}`}>
          {posts?.map(post => (
            <li key={post.uid} className={styles.listContent}>
              <section>
                <Link href={`/post/${post.uid}`}>
                  <a>
                    <h1>{post.data.title}</h1>
                  </a>
                </Link>
                <p>{post.data.subtitle}</p>
              </section>
              <aside>
                <div>
                  <FiCalendar />
                  <time>{post.first_publication_date}</time>
                </div>
                <div>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </aside>
            </li>
          ))}
        </ul>
        {nextPage && (
          <button
            type="button"
            className={styles.loadPostsButton}
            onClick={loadPosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.author', 'posts.subtitle'],
      pageSize: 5,
    }
  );

  const posts = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
