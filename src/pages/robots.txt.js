import { SITE_URL } from "../config/site";

function generateRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.end(generateRobotsTxt());

  return {
    props: {},
  };
}

export default function RobotsTxt() {
  return null;
}
