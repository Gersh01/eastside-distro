# Catalogue data review

Questions and corrections found while transcribing `docs/reference/EastSide-Catalogue.pdf` into
`src/features/catalog/data/products.ts`. Please confirm or correct each item; then update the
catalog with the `catalog-update` skill.

## Needed before online ordering

1. **Prices.** The catalogue has none. We need retail and wholesale prices per SKU and pack, plus
   any volume breaks and minimum orders.
2. **What retail customers can buy.** Same cases and half cases as wholesale, or singles and
   4-packs? Are bulk sizes (10 kg, 25 kg, gallon extracts) wholesale-only?
3. **Phone number** for "call or text your rep" (not in the catalogue), and business hours.
4. **Hemp THC listings** (Oracle Organix 10 and 50 Hemp Derived): keep, display-only, or archive
   before the federal cap on December 11, 2026? See [compliance.md](compliance.md).
5. **Image rights.** Product photos were extracted from the catalogue as placeholders. Confirm you
   may use brand imagery online, or send official assets.

## Corrections made (please confirm)

| Product                        | Catalogue says                         | Site uses / question                                           |
| ------------------------------ | -------------------------------------- | -------------------------------------------------------------- |
| Oracle Organix 50 Hemp Derived | Details: "12 fl oz can · 10mg"         | 50mg (name and cans say 50MG)                                  |
| White Rabbit                   | "Ten flavors deep" but lists 9 flavors | 9 flavors listed. Is one missing?                              |
| White Rabbit                   | Flavor "Dr Pepper"                     | "Dr. Rabbit" (name on the can; avoids the Dr Pepper trademark) |
| Leilo                          | "Tagerine Mango"                       | "Tangerine Mango"                                              |
| Tik Tonics                     | "Botanicls"                            | "botanicals"                                                   |
| Vibe9                          | "one-the-go"                           | "on-the-go"                                                    |
| MIT45 GO                       | "Botanical extract Hney Gel"           | "honey gel"                                                    |
| Yerba Madre                    | "Traditionaly"                         | "traditionally"                                                |
| Botanical Powder Extract       | "10mg Botanical Extrac per gram"       | "extract"                                                      |
| Kava Joy Shot                  | Tagline "Kava Kava Spirit"             | "kava kava shot" (the bottle says "Kava Kava Shot")            |

## Inconsistencies to check

| Product                      | Question                                                                                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nu Mood                      | Catalogue lists "Passion Fruit Lychee" (45mg); the can pictured says "Dragon Fruit Lychee".                                                                                            |
| Odyssey 222 / Core           | Details say "222mg / 85mg adaptogen blend"; cans say 222MG / 85MG **caffeine**. Which is right?                                                                                        |
| Odyssey Core                 | Flavors listed (Cola, Dragon Fruit Lemonade, Tropical, Blackberry Lemon Twist) differ from the cans pictured (Passion Fruit Guava, Tropical Breeze, Blackberry Lemonade).              |
| Sir Inkwell's Laser Lemonade | Details say 16 fl oz; cans pictured are 12 fl oz (355 mL).                                                                                                                             |
| Tik Tonics                   | Details say 30 mL; the box says "2 oz shot" (60 mL).                                                                                                                                   |
| Vibe9                        | Order unit says "2 fl oz" with no case size; the site assumes 12 per case with half cases. Flavors: catalogue lists Green Apple, but images show Apple Crisp, Blue Razz and Fire Shot. |
| MIT45 GO                     | Details say 30 mL per sachet; the package pictured says 0.5 oz (14.4 g).                                                                                                               |
| Botanical Liquid Extract     | "1 gallon is 3780 mL" (a US gallon is 3,785 mL). Fine for serving math; confirm the label.                                                                                             |
| White Label Pouch Service    | Listed as "contact sales directly". The site marks it **quote only** (no ordering).                                                                                                    |
| Company history              | Catalogue cover: "Serving Orlando since 2023"; onboarding sheet logo: "Since 2020". The site shows neither.                                                                            |
| Branding                     | Onboarding sheet uses the older "Eastside Distribution Co. & Botanicals" logo; the site uses the 2026 catalogue's lime "e" mark.                                                       |
| How to order (p. 36)         | "No portal, no login, no forms." Update this page when online ordering launches.                                                                                                       |

## Notes

- Catalogue page 17 is missing from the contents (no product).
- Inferred labels on the onboarding sheet (partly covered by form fields in the image):
  goal "Private Label" and next step "Request Samples (if available)".
