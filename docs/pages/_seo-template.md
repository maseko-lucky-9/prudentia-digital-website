# SEO Template — Service Detail Pages

Every new service detail page must include all the items below in the `<head>`. Lifted from `/ai/index.html` and extended with international locale alternates.

## Core meta

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{SERVICE_NAME}} — Prudentia Digital · {{SERVICE_SHORT_TAGLINE}} · South Africa</title>
<meta name="description" content="{{META_DESCRIPTION_<=160chars}}">
<link rel="canonical" href="https://prudentiadigital.co.za/{{SLUG}}/">
```

## Open Graph

```html
<meta property="og:title" content="{{SERVICE_NAME}} — Prudentia Digital">
<meta property="og:description" content="{{OG_DESCRIPTION}}">
<meta property="og:url" content="https://prudentiadigital.co.za/{{SLUG}}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Prudentia Digital">
<meta property="og:locale" content="en_ZA">
<meta property="og:locale:alternate" content="en_GB">
<meta property="og:locale:alternate" content="en_US">
<meta property="og:image" content="https://prudentiadigital.co.za/assets/og-image-1200x630.png">
<meta property="og:image:secure_url" content="https://prudentiadigital.co.za/assets/og-image-1200x630.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Prudentia Digital — {{SERVICE_NAME}}. Production engineering for South African and international businesses.">
```

## Twitter card

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{SERVICE_NAME}} — Prudentia Digital">
<meta name="twitter:description" content="{{TWITTER_DESCRIPTION_<=160chars}}">
<meta name="twitter:image" content="https://prudentiadigital.co.za/assets/og-image-1200x630.png">
```

## hreflang alternates (international SEO)

```html
<link rel="alternate" hreflang="en" href="https://prudentiadigital.co.za/{{SLUG}}/">
<link rel="alternate" hreflang="x-default" href="https://prudentiadigital.co.za/{{SLUG}}/">
```

## JSON-LD: Service schema (mandatory)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{{SERVICE_NAME}}",
  "provider": {
    "@type": "Organization",
    "name": "Prudentia Digital",
    "url": "https://prudentiadigital.co.za/",
    "logo": "https://prudentiadigital.co.za/assets/logo-icon-white-512.png",
    "areaServed": ["South Africa", "Worldwide"]
  },
  "areaServed": ["South Africa", "Worldwide"],
  "serviceType": "{{SERVICE_TYPE}}",
  "description": "{{SERVICE_DESCRIPTION_LONG}}",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "{{SERVICE_NAME}} engagements",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "{{TIER_1_NAME}}",
          "description": "{{TIER_1_DESCRIPTION}}"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "{{TIER_2_NAME}}",
          "description": "{{TIER_2_DESCRIPTION}}"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "{{TIER_3_NAME}}",
          "description": "{{TIER_3_DESCRIPTION}}"
        }
      }
    ]
  }
}
</script>
```

## JSON-LD: FAQPage schema (mandatory; mirrors the 6 FAQ items)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{{FAQ_1_Q}}",
      "acceptedAnswer": { "@type": "Answer", "text": "{{FAQ_1_A}}" }
    },
    {
      "@type": "Question",
      "name": "{{FAQ_2_Q}}",
      "acceptedAnswer": { "@type": "Answer", "text": "{{FAQ_2_A}}" }
    }
    /* ...continue for FAQ 3..6 */
  ]
}
</script>
```

## Font preloads (match `/ai/index.html`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap">
```

## Title & description budget

- `<title>`: ≤ 65 chars including " · Prudentia Digital · South Africa" suffix
- `meta description`: ≤ 160 chars; lead with the primary outcome the service delivers
- `og:description` & `twitter:description`: ≤ 160 chars each

## Per-service tier suggestions

These are starting suggestions — each Phase 2 writer adapts based on research.

| Slug | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| web | Discovery Sprint (1 week) | Product Build (8-12 weeks) | Retainer (monthly) |
| cloud | Architecture Review (1 week) | Migration / Greenfield Build (6-10 weeks) | Platform Retainer (monthly) |
| data | Data Audit (1 day) | Dashboard / Pipeline Build (4-8 weeks) | Analytics Retainer (monthly) |
| advisory | Transformation Consult (1-3 days) | Roadmap & ADRs Engagement (4-6 weeks) | Steering Retainer (monthly) |
| api | Integration Assessment (1 week) | API Design + Build (4-8 weeks) | Reliability Retainer (monthly) |
