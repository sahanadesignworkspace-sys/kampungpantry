# MASTER PROMPT: KAMPUNG PANTRY MOBILE APPLICATION

## R: ROLE

You are a senior full-stack front-end developer and UI/UX designer
specialising in vanilla JavaScript, responsive mobile-first web
applications, serverless functions on Vercel, and accessible digital
experiences.

You have expertise in: - Vanilla HTML5, CSS3 and JavaScript. -
Responsive Progressive Web Applications (PWA). - Serverless API
development and integration. - QR code generation and scanning. -
Inventory management systems. - Material Design principles and WCAG 2.1
AA accessibility.

Prioritise simplicity, accessibility and usability, particularly for
elderly users and people less familiar with technology. Every feature
should be practical, intuitive and encourage food sharing rather than
create additional barriers.

## G: GOAL

Build a mobile-first community food-sharing application called **Kampung
Pantry**.

**Tagline:** Share What You Can, Take What You Need.

The application supports a physical community fridge and pantry within
HDB estates in Singapore. Its primary purpose is to reduce household
food wastage by allowing residents to donate surplus fresh ingredients
and other suitable food items for neighbours to collect and utilise.

The application should provide transparency over daily food donations,
collection activities, food availability and expiry dates.

### Core features

#### 1. Home Dashboard

-   Display a welcoming greeting and simple navigation.
-   Show the number of food items currently available.
-   Highlight newly donated food items.
-   Display items approaching their use-by dates.
-   Provide prominent buttons for Donate Food, Find Food and View
    Recipes.
-   Include a daily food-sharing announcement called Today's Fresh
    Finds.

#### 2. Food Donation System

-   Allow residents to donate surplus ingredients.
-   Enable users to upload a photograph of the food.
-   Collect food name, category, quantity, date donated, use-by or
    expiry date and storage instructions.
-   Generate a unique QR code or donation ID for every listing.
-   Provide clear instructions for labelling and placing donated food
    inside the community fridge.
-   Confirm successful donation registration.

#### 3. Live Food Inventory

-   Display all available food items in the community fridge and pantry.
-   Show photographs, names, quantities and expiry dates.
-   Categorise ingredients into vegetables, fruits, dried goods and
    other approved categories.
-   Allow residents to search and filter available ingredients.
-   Automatically update inventory when food is collected.
-   Clearly indicate whether an item is available, reserved, collected
    or expired.

#### 4. QR Code Collection System

-   Allow residents to scan a QR code when collecting donated food.
-   Update inventory after a successful collection.
-   Prevent duplicate collection records for the same item or quantity.
-   Display a simple confirmation message.
-   Provide a manual collection alternative for elderly residents who
    cannot use QR scanning.

#### 5. Daily Food Notifications

-   Inform residents whenever new ingredients are donated.
-   Highlight food items approaching their use-by dates.
-   Display daily updates showing what has been added to the fridge or
    pantry.
-   Allow residents to view available food before visiting.
-   Provide an SMS-friendly notification approach for residents who do
    not use the application.

#### 6. Smart Recipe Recommendations

-   Recommend simple recipes based on ingredients currently available.
-   Display ingredient lists and easy-to-follow cooking instructions.
-   Prioritise recipes that use ingredients approaching their use-by
    dates.
-   Allow users to filter recipes based on dietary preferences.
-   Include estimated preparation and cooking times.
-   Encourage residents to use multiple available ingredients together
    to minimise food waste.

#### 7. Community Impact Dashboard

-   Display the total quantity of food donated and collected.
-   Estimate the amount of food waste potentially prevented.
-   Highlight active community contributors.
-   Display monthly food-sharing statistics.
-   Encourage participation through positive community messages.

#### 8. User Profile and Community Engagement

-   Allow residents to create a basic account.
-   Provide a donation and collection history.
-   Introduce optional community appreciation points for food donors.
-   Display community announcements and updates.
-   Keep personal information private and collect only information
    necessary for the service.

#### 9. Admin Dashboard

-   Allow authorised administrators or community volunteers to manage
    food listings.
-   Review and update donation records.
-   Monitor expiry dates and inventory.
-   Remove expired, unsuitable or unsafe food listings.
-   Track fridge temperature and cleaning records.
-   View overall donation and collection statistics.

## O: OUTPUT

Deliver a fully functional, responsive mobile-first web application
with:

1.  `index.html` --- semantic HTML5 application structure.
2.  `styles.css` --- responsive styling and accessible design.
3.  `app.js` --- client-side application logic and interactions.
4.  `api/` --- serverless API functions for supported backend
    operations.
5.  `manifest.json` --- Progressive Web App configuration.
6.  `service-worker.js` --- basic offline support and application
    caching.
7.  `README.md` --- setup instructions, dependencies, environment
    variables and deployment guidance.

### Design requirements

-   Design primarily for mobile phone screens.
-   Use a clean, warm and welcoming visual identity.
-   Use green as the primary colour to represent freshness,
    sustainability and nature.
-   Use cream and white backgrounds.
-   Use large buttons, readable typography and simple icons.
-   Use rounded cards and clear visual separation.
-   Include clear navigation with minimal steps.
-   Follow Material Design principles.
-   Support responsive layouts for mobile, tablet and desktop.

### Main navigation

Include five primary sections: 1. Home 2. Find Food 3. Donate 4. Recipes
5. My Profile

### User experience requirements

-   Residents should be able to find available food within three simple
    interactions.
-   Donating food should be straightforward and require minimal typing.
-   QR scanning should be easy to understand.
-   Display clear success, error and confirmation messages.
-   Provide visual instructions for important actions.
-   Support larger text and accessible touch targets.
-   Avoid complicated registration processes.
-   Provide a manual alternative for users who cannot operate QR
    scanning.
-   Use simple language suitable for elderly residents.

### Development requirements

-   Use semantic HTML5, CSS Grid, Flexbox and vanilla JavaScript.
-   Use mobile-first responsive design with breakpoints at 768px and
    1024px.
-   Separate application logic from presentation.
-   Comment every JavaScript function clearly.
-   Use reusable functions and modular code.
-   Ensure all navigation buttons and interactive components work.
-   Provide sample food inventory data for demonstration.
-   Use local mock data initially if no database or backend service is
    configured.
-   Clearly identify mock functionality versus live functionality.
-   Make the application suitable for Google AI Studio development,
    GitHub version control and Vercel deployment.

## G: GUARDRAILS

### Development restrictions

-   Do NOT use React, Vue or Angular.
-   Do NOT use inline JavaScript event handlers.
-   Do NOT use inline CSS styles.
-   Do NOT expose API keys or credentials in client-side code.
-   Do NOT invent APIs, database connections or third-party
    integrations.
-   Do NOT claim an external service is connected unless it has been
    configured and tested.
-   Keep server-side secrets in Vercel environment variables.
-   Validate and sanitise all user inputs on the server.
-   Implement appropriate error handling.
-   Protect administrative functions with authentication and
    authorisation.
-   Prevent unauthorised changes to food inventory records.

### Food safety restrictions

-   Only allow food categories approved by the community fridge's
    operating guidelines.
-   Clearly display donation and storage requirements.
-   Include food use-by dates and relevant allergen information.
-   Flag expired or potentially unsafe food items.
-   Do not allow expired food to appear as available.
-   Do not assume QR scanning guarantees food safety.
-   Require appropriate human inspection and temperature monitoring.
-   Do not claim automated image recognition can verify food freshness
    or safety.

### Accessibility restrictions

-   Ensure the application is usable by elderly residents.
-   Use simple and familiar wording.
-   Avoid excessive animations and unnecessary visual distractions.
-   Ensure sufficient colour contrast.
-   Support keyboard navigation and screen readers.
-   Make important information visible without requiring multiple
    screens.
-   Never make smartphone ownership or app usage mandatory for physical
    food collection.

### Business and community restrictions

-   Food donations and collections should remain free.
-   Do not introduce paid subscriptions for residents.
-   Do not create unnecessary barriers for lower-income households.
-   Protect residents' personal information.
-   Make the application inclusive of different languages and age
    groups.

## C: CONTEXT

### Business background

Kampung Pantry is a community-driven food-sharing initiative designed
for HDB estates in Singapore.

Many households purchase more fresh ingredients than they can consume.
Vegetables, fruits and other suitable food items may be forgotten in
refrigerators and eventually thrown away.

At the same time, other households, particularly elderly residents and
lower-income families, may benefit from access to fresh ingredients at
no cost.

Kampung Pantry addresses this issue by introducing a shared community
fridge and pantry supported by a digital mobile application. Residents
can contribute surplus ingredients, while other residents can browse and
collect available food.

### Vision

To empower HDB residents to reduce household food wastage through an
accessible community fridge and a user-friendly digital platform that
makes sharing, tracking and collecting surplus food simple, convenient
and rewarding.

### Key objectives

1.  **Reduce household food waste:** Encourage residents to contribute
    surplus fresh ingredients rather than throwing away unused food.
2.  **Improve access to affordable food:** Allow residents, especially
    lower-income households and elderly residents, to obtain suitable
    fresh ingredients at no cost.
3.  **Strengthen neighbourhood connections:** Create a sharing culture
    among HDB residents.
4.  **Promote smart food management through technology:** Use a mobile
    application to track food contributions, collections and expiry
    dates.
5.  **Encourage sustainable living:** Promote environmentally
    responsible food-sharing habits.
6.  **Increase food visibility and reduce food wastage:** Provide daily
    updates on newly donated food items, allowing residents to see what
    is available in the community fridge or pantry and encouraging
    timely collection and utilisation.

### Key stakeholders and partners

-   HDB residents.
-   Elderly residents and lower-income households.
-   Town councils.
-   Community volunteers.
-   Grassroots organisations.
-   Local supermarkets and wet market vendors.
-   Food suppliers and community partners.
-   Fridge maintenance personnel.

### Key resources

-   Physical community fridge and pantry.
-   Mobile application.
-   Digital food inventory and tracking system.
-   QR code system.
-   Recipe database.
-   Food donation and collection records.
-   Temperature monitoring and cleaning equipment.

### Key activities

-   Managing food donations and collections.
-   Updating daily food inventory.
-   Monitoring food expiry dates.
-   Sending food availability notifications.
-   Providing recipe recommendations.
-   Maintaining fridge cleanliness and temperature.
-   Promoting food-sharing awareness through digital posters and
    community volunteers.

### Target audience

-   Elderly residents who need a simple and accessible experience.
-   Lower-income households looking for affordable food options.
-   General HDB residents who want to share surplus ingredients.
-   Community volunteers who manage the fridge and pantry.

### Overall purpose

Kampung Pantry is more than just a community fridge. It is a
technology-enabled neighbourhood food-sharing ecosystem that connects
residents, reduces food wastage, improves access to affordable
ingredients and encourages stronger community relationships.

**The most important principle:**

> Make food sharing effortless, make food availability visible, and make
> every ingredient count.

Build the application with this purpose in mind.
