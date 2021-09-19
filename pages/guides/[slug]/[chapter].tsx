import Page from "components/pages/guides/[slug]/[chapter]";
import fs from "fs";
import matter from "gray-matter";
import MDXPrism from "mdx-prism";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import dynamic from "next/dynamic";
import path from "path";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkCodeTitles from "remark-code-titles";
import remarkExternalLinks from "remark-external-links";
import remarkSlug from "remark-slug";
import remarkTOC from "remark-toc";

const Callout = dynamic(
  import(/* webpackChunkName: "Callout" */ "components/mdx/callout")
);

const Jumbotron = dynamic(
  import(/* webpackChunkName: "Jumbotron" */ "components/mdx/jumbotron")
);

const Link = dynamic(
  import(/* webpackChunkName: "Link" */ "components/mdx/link")
);

const root = process.cwd();
const components = { Callout, Jumbotron, Link };

interface IProps {
  mdxSource: any;
  frontMatter: any;
  guides: any;
  slug: string;
  chapter: string;
}

const GuidesChapterPage: NextPage<IProps> = ({
  guides,
  mdxSource,
  frontMatter,
  slug,
  chapter,
}) => {
  return (
    <Page
      content={<MDXRemote {...mdxSource} components={components} />}
      frontMatter={frontMatter}
      guides={guides}
      slug={slug}
      chapter={chapter}
    />
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPaths = fs
    .readdirSync(path.join(root, "data", "guides"))
    .map((p) => {
      return fs
        .readdirSync(path.join(root, "data", "guides", p))
        .map((chapter) => {
          return {
            params: {
              slug: p.replace(/\.mdx/, ""),
              chapter: chapter.replace(/\.mdx/, ""),
            },
          };
        });
    });

  const paths = allPaths.reduce((previousChapter, nextChapter) =>
    previousChapter.concat(nextChapter)
  );

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const guidesRoot = path.join(root, "data", "guides", `${params.slug}`);
  const guides = fs.readdirSync(guidesRoot).map((p) => {
    const content = fs.readFileSync(path.join(guidesRoot, p), "utf8");

    return {
      slug: p.replace(/\.mdx/, ""),
      content,
      frontMatter: matter(content).data,
    };
  });

  const source = fs.readFileSync(
    path.join(
      root,
      "data",
      "guides",
      `${params.slug}`,
      `${params.chapter}.mdx`
    ),
    "utf8"
  );
  const { data, content } = matter(source);
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [
        remarkSlug,
        remarkCodeTitles,
        remarkTOC,
        remarkExternalLinks,
      ],
      rehypePlugins: [rehypeAutolinkHeadings, MDXPrism],
      compilers: [],
    },
    scope: {},
  });

  return {
    props: {
      guides,
      mdxSource,
      frontMatter: data,
      slug: params.slug,
      chapter: params.chapter,
    },
  };
};

export default GuidesChapterPage;

export const config = {
  unstable_runtimeJS: false,
};
