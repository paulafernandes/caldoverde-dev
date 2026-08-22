export default function RestaurantSchema({ url }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Caldo Verde",
    url,
    email: "info@caldoverde.es",
    servesCuisine: "Portuguese",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}