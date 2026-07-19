# RT (Mateusz)

## Intro

Tell us about your projects from the last 2-3 years. Focus on the system architecture, your role, and the most challenging technical decisions.

Na co warto zwrócić uwagę:

- poziom samodzielności,
- wielkość systemów,
- czy mówi językiem architekta czy implementatora,
- czy rozumie biznes stojący za systemem.

## Deep Dive - Mikroserwisy i DDD

### Pytanie 1

W CV napisałeś, że budowałeś systemy oparte o DDD i mikroserwisy. Opowiedz o jednym konkretnym przykładzie.

Dopytania:

- Jak definiowaliście bounded context? (Bounded Context określa granicę, w której dane pojęcie ma jedno konkretne znaczenie).
- Kto podejmował decyzję o podziale domeny?
- Jak wyglądała komunikacja między serwisami?
- Synchronizacja czy asynchronizacja?
- Eventy czy REST?

### Pytanie 2

Jakie problemy napotkaliście podczas migracji z monolitu do mikroserwisów?

Dopytania:

- Co było pierwszym wydzielonym serwisem?
- Jak rozwiązaliście problem współdzielonej bazy?
- Jak wyglądał deployment podczas migracji?
- Co się nie udało?

### Pytanie 3

Jak wyglądał Aggregate Root w jednym z Waszych kontekstów domenowych?

Na co warto zwrócić uwagę:

- Entity vs Value Object
- invariants (reguły biznesowe)
- encapsulation
- domain events

Dopytania:

- Jakie były najważniejsze invariants w tym agregacie?
- Jak zabezpieczyliście agregat przed obejściem reguł biznesowych (invariants + encapsulation)?
- Jakie Domain Eventy generował ten agregat?
- Kto konsumował te eventy i co się działo, gdy ich przetworzenie się nie udało?

## .NET i Backend

### Pytanie 1

Jak wyglądałby Twój wzorcowy projekt ASP.NET Core dla nowego mikroserwisu?

Na co warto zwrócić uwagę:

- Clean Architecture
- CQRS
- MediatR (lub alternatywa)
- EF Core
- testy

Dopytania:

- Czy ten projekt zawierałby jakieś wzorce projektowe?
- Jak rozwiązałbyś komunikację z bazą danych w Twoim setupie?

### Pytanie 2

W jakich sytuacjach Entity Framework zaczyna być problemem?

Dopytania:

- Jak diagnozowałbyś N+1?
- W jakich sytuacjach zawsze używasz AsNoTracking?
- Dlaczego projection jest często lepszy od Include?
- Kiedy świadomie zrezygnowałbyś z LINQ i użył SQL?
- Jak zaktualizowałbyś milion rekordów bez pobierania ich do pamięci?

### Pytanie 3

Jak diagnozujesz problem wydajności API, które nagle z 200 ms zaczyna odpowiadać przez 5 sekund?

Na co warto zwrócić uwagę:

- telemetry
- App Insights / OpenTelemetry
- SQL profiling
- logi
- dependency tracing

### Pytanie 4

Jak zaimplementowałbyś idempotentny endpoint do przetwarzania płatności?

## Cloud / DevOps

W CV wspomniałeś o Azure jak i AWS.

### Pytanie 1

Opowiedz o najbardziej zaawansowanym pipeline CI/CD jaki budowałeś.

Dopytania:

- Co robiliście, gdy deployment na produkcję okazywał się błędny?
- Ile czasu zajmował Wam rollback?
- Kto musiał zatwierdzić deployment na produkcję?
- environment promotion
- Jak zarządzaliście konfiguracją między środowiskami?
- [opcjonalnie, bo sam nie wiem] blue/green deployment
- Jakie warunki musiały zostać spełnione, żeby pipeline przeszedł dalej?
- Czy pipeline wdrażał tylko aplikację, czy również infrastrukturę jako kod?
- Jak zarządzaliście sekretami?

### Pytanie 2

Jak wyglądało wykorzystanie Pulumi?

Dopytania:

- Dlaczego Pulumi?
- Co było provisionowane (automatycznie tworzone i konfigurowane)?
- Jak wyglądało zarządzanie stanem?

### Pytanie 3

Co zrobiłbyś, gdy produkcyjny mikroserwis zaczął zwracać błędy po deploymencie?

## Lead Developer / Seniority

### Pytanie 1

Jaka była najtrudniejsza decyzja techniczna, którą musiałeś przeforsować jako Lead Developer?

### Pytanie 2

Jak reagujesz, gdy dwóch seniorów ma całkowicie odmienne rozwiązania tego samego problemu?

### Pytanie 3

Jak rozpoznajesz, że projekt jest overengineered?

## AI w developmentcie

W CV kandydat świadomie podkreśla GitHub Copilot, Claude, Cursor.

### Pytanie 1

W jakich zadaniach AI realnie przyspiesza Ci pracę, a gdzie generuje więcej problemów niż korzyści?

Dopytania:

- Code review
- Refactoring
- Testy
- Security
- Hallucynacje

## Front

### Pytanie 1

Opowiedz o najbardziej złożonym ekranie lub module React, który projektowałeś.

Dopytania:

- Jaki był problem biznesowy?
- Jak wyglądał przepływ danych?
- Jak zarządzaliście stanem?

### Pytanie 2

Jak zarządzaliście stanem aplikacji?

### Pytanie 3

Korzystaliście z React Query lub podobnego rozwiązania? Jakie problemy rozwiązywało?

### Pytanie 4

Jak diagnozujesz problemy wydajnościowe w React?
