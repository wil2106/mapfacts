![](./assets/images/icon.png)
### Mapfacts
A crowdsourced map app to learn more about city's neighborhoods (inspired by [hoodmaps](https://hoodmaps.com/)).

## Tech stack
Typescript, React-Native, Expo, expo-router, React-Native Elements, Zustand, Turf, react-native-maps, Supabase, Axios, Google Places API ...

## Demo

## Features
- Sign in screen
  - Magic link signin (passwordless signin with email)
- Home screen
  - Display facts on the map depending on zoom level and number of likes (Thanks to Turf, we only query facts visible on the screen and not previously fetched)
  - Display heatmap where facts are
  - Recenter to current location
- Fact screen
  - Display the fact zone and info (text, vote count, is trending)
  - Vote positively or negatively a fact
  - Report
  - Recenter
  - Share
- Fact creation screen
  - Add text
  - Rotate text
  - Set zone radius
- Search screen
  - Search place
- Account screen
  - See posted facts
  - Order by date or popularity
  - Open a fact on the map
- Settings screen
  - Enable/Disable notifications
  - Open Crisp chat support
  - Open website
  - Rate app
  - Share app
  - Open Privacy polocy and TOU
  - Sign out
  - Delete account
- Radar screen
  - Enable/Disable radar
  - Set min votes
  - Set min delay between alerts

## TO-DO
- Notifications
- Radar feature to get notified when you physically enter a zone (like in skyrim)
- Landing page website
- Testing
- Comments
- Supabase row level security rules

## Run locally on ios
- Install depedencies in root folder and in ./website folder
- Make a first app build with ```eas build --platform ios --profile development```
- Fill ./website/public/.well-known/apple-app-site-association
- Deploy ./website on vercel for example
- Create a supabase project
- In *Supabase/Authentication/Providers* enable email provider
- In *Supabase/Authentication/Url configuration* set site URL (```https://mapfacts.vercel.app/``` for example) and Redirect URLs (```https://mapfacts.vercel.app/*``` for example)
- Create a google cloud project and enable Maps SDK for Android, Maps SDK for iOS, Places API
- Create a .env file with supabase DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_PLACES_API_KEY
- Set googleMapsApiKey in app.json
- Set constants links in ./helpers/constants.tsx
- Execute yarn db-push to create database tables
- Create database functions:
<pre>
    create or replace function fact(fact_id integer, user_id text)
    returns table (
      id "Fact".id%TYPE,
      createdat "Fact"."createdAt"%TYPE,
      text "Fact".text%TYPE,
      radiusm "Fact"."radiusM"%TYPE,
      angled "Fact"."angleD"%TYPE,
      color "Fact".color%TYPE,
      authorid "Fact"."authorId"%TYPE,
      latitude float,
      longitude float,
      score int,
      votecount int,
      uservote int,
      recentvotecount int
    )
    language sql
    as $$
      select "Fact".id, "Fact"."createdAt", "Fact".text, "Fact"."radiusM", "Fact"."angleD", "Fact".color, "Fact"."authorId", st_y(location::geometry) as latitude, st_x(location::geometry) as longitude, COALESCE(SUM("AVote".value) * COUNT(DISTINCT "AVote".id) / COUNT(*), 0) AS score, COALESCE(COUNT(DISTINCT "AVote".id), 0) AS votecount, "UserVote".value as uservote, COALESCE(COUNT(DISTINCT "RecentVote".id), 0) as recentvotecount
      from "Fact"
      LEFT JOIN "Vote" as "AVote" ON "AVote"."factId" = "Fact".id
      LEFT JOIN "Vote" as "UserVote" ON "UserVote"."factId" = "Fact".id AND "UserVote"."authorId" = user_id
      LEFT JOIN "Vote" as "RecentVote" ON "RecentVote"."factId" = "Fact".id AND "RecentVote"."createdAt" >= (CURRENT_DATE - INTERVAL '3 days') AND "RecentVote".value = 1
      WHERE "Fact".id = fact_id
      GROUP BY "Fact".id, "UserVote".value;
    $$;
</pre>

<pre>
    create or replace function facts_in_area(user_id text, polygons text)
    returns table (
      id "Fact".id%TYPE,
      createdAt "Fact"."createdAt"%TYPE,
      text "Fact".text%TYPE,
      radiusM "Fact"."radiusM"%TYPE,
      angleD "Fact"."angleD"%TYPE,
      color "Fact".color%TYPE,
      authorid "Fact"."authorId"%TYPE,
      latitude float,
      longitude float,
      score int,
      votecount int,
      uservote int,
      recentvotecount int
    )
    language sql
    as $$
      select "Fact".id, "Fact"."createdAt", "Fact".text, "Fact"."radiusM", "Fact"."angleD", "Fact".color, "Fact"."authorId", st_y(location::geometry) as latitude, st_x(location::geometry) as longitude, COALESCE(SUM("AVote".value) * COUNT(DISTINCT "AVote".id) / COUNT(*), 0) AS score, COALESCE(COUNT(DISTINCT "AVote".id), 0) AS votecount, "UserVote".value as uservote, COALESCE(COUNT(DISTINCT "RecentVote".id), 0) as recentvotecount
      from "Fact"
      LEFT JOIN "Vote" as "AVote" ON "AVote"."factId" = "Fact".id
      LEFT JOIN "Vote" as "UserVote" ON "UserVote"."factId" = "Fact".id AND "UserVote"."authorId" = user_id
      LEFT JOIN "Vote" as "RecentVote" ON "RecentVote"."factId" = "Fact".id AND "RecentVote"."createdAt" >= (CURRENT_DATE - INTERVAL '3 days') AND "RecentVote".value = 1
      WHERE ST_Within(
        "Fact".location::geometry,
        ST_GeomFromGeoJSON(polygons)
      )
      GROUP BY "Fact".id, "UserVote".value
      ORDER BY score DESC;
    $$;
</pre>

<pre>
    create or replace function user_facts_by_date(user_id text, last_date date, take integer)
    returns table (
      id "Fact".id%TYPE,
      createdAt "Fact"."createdAt"%TYPE,
      text "Fact".text%TYPE,
      radiusM "Fact"."radiusM"%TYPE,
      angleD "Fact"."angleD"%TYPE,
      color "Fact".color%TYPE,
      authorid "Fact"."authorId"%TYPE,
      latitude float,
      longitude float,
      score int,
      votecount int,
      uservote int,
      recentvotecount int
    )
    language sql
    as $$
      select "Fact".id, "Fact"."createdAt", "Fact".text, "Fact"."radiusM", "Fact"."angleD", "Fact".color, "Fact"."authorId", st_y(location::geometry) as latitude, st_x(location::geometry) as longitude, COALESCE(SUM("AVote".value) * COUNT(DISTINCT "AVote".id) / COUNT(*), 0) AS score, COALESCE(COUNT(DISTINCT "AVote".id), 0) AS votecount, "UserVote".value as uservote, COALESCE(COUNT(DISTINCT "RecentVote".id), 0) as recentvotecount
      from "Fact"
      LEFT JOIN "Vote" as "AVote" ON "AVote"."factId" = "Fact".id
      LEFT JOIN "Vote" as "UserVote" ON "UserVote"."factId" = "Fact".id AND "UserVote"."authorId" = user_id
      LEFT JOIN "Vote" as "RecentVote" ON "RecentVote"."factId" = "Fact".id AND "RecentVote"."createdAt" >= (CURRENT_DATE - INTERVAL '3 days') AND "RecentVote".value = 1
      WHERE "Fact"."authorId" = user_id AND "Fact"."createdAt" < last_date
      GROUP BY "Fact".id, "UserVote".value
      ORDER BY "Fact"."createdAt" DESC
      LIMIT take;
    $$;
</pre>

<pre>
    create or replace function user_facts_by_popularity(user_id text, last_score integer, take integer)
    returns table (
      id "Fact".id%TYPE,
      createdAt "Fact"."createdAt"%TYPE,
      text "Fact".text%TYPE,
      radiusM "Fact"."radiusM"%TYPE,
      angleD "Fact"."angleD"%TYPE,
      color "Fact".color%TYPE,
      authorid "Fact"."authorId"%TYPE,
      latitude float,
      longitude float,
      score int,
      votecount int,
      uservote int,
      recentvotecount int
    )
    language sql
    as $$
      select "Fact".id, "Fact"."createdAt", "Fact".text, "Fact"."radiusM", "Fact"."angleD", "Fact".color, "Fact"."authorId", st_y(location::geometry) as latitude, st_x(location::geometry) as longitude, COALESCE(SUM("AVote".value) * COUNT(DISTINCT "AVote".id) / COUNT(*), 0) AS score, COALESCE(COUNT(DISTINCT "AVote".id), 0) AS votecount, "UserVote".value as uservote, COALESCE(COUNT(DISTINCT "RecentVote".id), 0) as recentvotecount
      from "Fact"
      LEFT JOIN "Vote" as "AVote" ON "AVote"."factId" = "Fact".id
      LEFT JOIN "Vote" as "UserVote" ON "UserVote"."factId" = "Fact".id AND "UserVote"."authorId" = user_id
      LEFT JOIN "Vote" as "RecentVote" ON "RecentVote"."factId" = "Fact".id AND "RecentVote"."createdAt" >= (CURRENT_DATE - INTERVAL '3 days') AND "RecentVote".value = 1
      WHERE "Fact"."authorId" = user_id
      GROUP BY "Fact".id, "UserVote".value
      HAVING COALESCE(SUM("AVote".value), 0) < last_score
      ORDER BY score DESC
      LIMIT take;
    $$;
</pre>