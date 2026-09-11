export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/es/",
      permanent: true,
    },
  };
}

export default function Home() {
  return null;
}
