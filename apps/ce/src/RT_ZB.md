# RT (Zbigniew)

## Intro

Tell us about your projects from the last 2-3 years. Focus on the system architecture, your role, and the most challenging technical decisions.

Focus:

- architekturze systemu,
- odpowiedzialności technicznej,
- decyzjach architektonicznych,
- skali rozwiązania.

Na co zwrócić uwagę

- czy mówi z perspektywy architekta,
- czy rozumie kompromisy architektoniczne,
- czy zna problemy produkcyjne,
- czy rozumie wymagania biznesowe.

## Architektura, DDD, CQRS, Event-Driven

### Pytanie 1

Opowiedz o systemie, w którym wykorzystaliście DDD.

Dopytania:

- Jak definiowaliście bounded context?
- Jak wyglądał podział domeny?
- Jakie były Aggregate Rooty?
- Jakie Domain Eventy występowały?
- Jakie były najważniejsze invariants?
- Które elementy były Entity, a które Value Object?

### Pytanie 2

W CV wspomniałeś o Event-Driven Architecture. Opowiedz o konkretnym przypadku wykorzystania eventów.

Dopytania:

- Dlaczego wybraliście EDA?
- Jakie eventy były publikowane?
- Jakiego brokera używaliście?
- Jak zapewnialiście idempotencję?
- Jak obsługiwaliście błędy?
- Jak wyglądał retry mechanism?

### Pytanie 3

Kiedy wybrałbyś Event Driven Architecture zamiast klasycznej komunikacji REST?

Na co zwrócić uwagę:

- luźne powiązanie,
- skalowalność,
- eventual consistency,
- niezależność zespołów.

### Pytanie 4

Jakie problemy napotkałeś podczas wdrażania CQRS?

Dopytania:

- Czy każde API potrzebuje CQRS?
- Kiedy CQRS jest przesadą?
- Jak wyglądał Read Model?
- Jak synchronizowaliście modele odczytu (eventy, brokery)?

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

Jak diagnozujesz problem wydajności API, które nagle z 200 ms zaczyna odpowiadać przez 5 sekund?

Na co warto zwrócić uwagę:

- telemetry
- App Insights / OpenTelemetry
- SQL profiling
- logi
- dependency tracing

### Pytanie 3

Jak zaimplementowałbyś idempotentny endpoint do przetwarzania płatności?

## GraphQL

### Pytanie 1

Dlaczego zdecydowaliście się na GraphQL zamiast REST?

Dopytania:

- jakie problemy rozwiązywał?
- jakie problemy wprowadzał?

### Pytanie 2

Jakie są największe zagrożenia wydajnościowe w GraphQL?

Na co warto zwrócić uwagę:

- N+1
- overfetching
- resolver chaining
- DataLoader

### Pytanie 3

W jakich sytuacjach dziś wybrałbyś REST zamiast GraphQL?

### Integracje Systemów

#### Pytanie 1

Opowiedz o najtrudniejszej integracji systemów, którą realizowałeś.

Dopytania:

- kto był właścicielem API?
- jak wyglądało wersjonowanie?
- jak radziliście sobie z błędami?
- jak wyglądały testy integracyjne?

#### Pytanie 2

Jak zaprojektowałbyś integrację z niestabilnym systemem zewnętrznym?

Na co warto zwrócić uwagę:

- retry
- timeout
- circuit breaker
- dead-letter queue
- monitoring

## Cloud / DevOps

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

W CV wspomniałeś o Terraformie. Jak wyglądało jego wykorzystanie?

Dopytania:

- Dlaczego Terraform?
- Co było provisionowane (automatycznie tworzone i konfigurowane)?
- Jak wyglądało zarządzanie state?
- Jak organizowaliście moduły?

### Pytanie 3

Jakie realne problemy rozwiązywaliście dzięki Kubernetes?

Dopytania:

- autoscaling
- rolling deployments
- self-healing
- service discovery

## Front

### Pytanie 1

Opowiedz o najbardziej złożonym module React, który projektowałeś.

Dopytania:

- przepływ danych
- state management
- integracja z backendem

### Pytanie 2

Jak diagnozujesz problemy wydajnościowe w React?

Na co warto zwrócić uwagę:

- React Profiler
- memo
- useMemo
- useCallback
- render tree

### Pytanie 3

Jak organizujesz strukturę dużej aplikacji React?

## Architekt / Seniority

### Pytanie 1

Jaka decyzja architektoniczna, którą podjąłeś kilka lat temu, dziś byłaby inna?

### Pytanie 2

Jak rozpoznajesz, że system staje się overengineered?

### Pytanie 3

Kiedy mikroserwisy są złym pomysłem?

### Pytanie 4

Kiedy wybrałbyś modular monolith zamiast mikroserwisów?

## AI w developmentcie

### Pytanie 1

W jakich obszarach AI najbardziej zwiększa produktywność zespołu developerskiego?

Dopytania:

- generowanie testów
- code review
- debugging
- dokumentacja
- bezpieczeństwo
- hallucynacje
