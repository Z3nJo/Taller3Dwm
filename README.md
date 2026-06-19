# RCTSP: Resource-Constrained Traveling Salesperson Problem

Este repositorio contiene la implementación y análisis para el problema **RCTSP (Resource-Constrained Traveling Salesperson Problem)**, desarrollado como parte del curso de **Optimización (OPT)** del **Semestre 7**.

## 👥 Integrantes
*   **Matias Santos**
*   **Jose Romero**
*   **David Cortez**

---

## Introducción al Problema

### ¿Qué es el TSP (Traveling Salesperson Problem)?
El **Problema del Agente Viajero (TSP)** es uno de los problemas de optimización combinatoria más estudiados en la historia. Consiste en encontrar la ruta de menor costo (o distancia) que visite un conjunto de ciudades exactamente una vez y regrese al punto de partida original.

*   **Por qué importa:** Es un problema clásico de la teoría de grafos y optimización combinatoria. Está clasificado como **NP-duro**, lo que significa que no se conoce un algoritmo de tiempo polinomial para resolverlo de forma exacta a medida que el número de ciudades crece significativamente.
*   **Dónde aparece:** Tiene aplicaciones masivas en logística, ruteo de vehículos, planificación de entregas, diseño de microchips, perforación de placas de circuito y problemas de recorridos en general.

---

### ¿Qué es el RCTSP (Resource-Constrained TSP)?
El **Problema del Agente Viajero con Restricciones de Recursos (RCTSP)** es una generalización avanzada del TSP estándar. En el mundo real, no basta con simplemente minimizar la distancia o el costo; los vehículos y agentes operan bajo **restricciones físicas y operativas estrictas** (recursos limitados).

En el RCTSP:
1.  Cada arco (o trayecto) entre dos ciudades $i$ y $j$ tiene asociado un **costo** $c_{ij}$ y un **consumo de recurso** $r_{ij}$ (por ejemplo, combustible, tiempo, batería o presupuesto).
2.  El objetivo es encontrar un ciclo hamiltoniano (un recorrido que visite cada ciudad exactamente una vez y regrese al origen) que **minimice el costo total**, asegurando que **el consumo acumulado del recurso no exceda un límite máximo predefinido $R_{\max}$**.

$$\min \sum_{(i,j) \in A} c_{ij} x_{ij}$$
$$\text{Sujeto a: } \sum_{(i,j) \in A} r_{ij} x_{ij} \le R_{\max}$$
$$\text{(y las restricciones estándar de ciclo hamiltoniano del TSP)}$$

#### Diferencias Clave
| Característica | TSP Estándar | RCTSP (Resource-Constrained) |
| :--- | :--- | :--- |
| **Objetivo** | Minimizar costo o distancia total. | Minimizar costo o distancia total. |
| **Restricciones** | Visitar cada ciudad exactamente una vez y volver al inicio. | Visitar cada ciudad exactamente una vez, volver al inicio **y no exceder $R_{\max}$**. |
| **Factibilidad** | Encontrar una solución factible es trivial (cualquier permutación de ciudades). | Encontrar una solución que sea factible (que cumpla con la restricción de recursos) es un problema NP-completo por sí mismo. |
| **Generalización** | Caso particular del RCTSP cuando $R_{\max} = \infty$. | Generaliza problemas complejos como el *Prize Collecting TSP* y el *Orienteering Problem*. |

---

## Aplicaciones del RCTSP
*   **Vehículos Eléctricos (EVs):** Minimizar el tiempo de viaje con restricciones de capacidad de batería ($R_{\max}$).
*   **Rutas de Drones (UAS):** Planificación de trayectos de inspección aérea donde el dron debe regresar antes de agotar su batería o combustible.
*   **Logística con Plazos de Entrega:** Minimizar la distancia recorrida bajo ventanas de tiempo o plazos de entrega acumulados (donde el tiempo es el recurso limitado).
*   **Planificación de Producción:** Secuenciación de tareas en una máquina con costos de cambio y plazos agregados de entrega.

---

## Métodos de Resolución
Dado que el RCTSP es un problema NP-duro, su resolución requiere diferentes enfoques dependiendo del tamaño de la instancia:

### 1. Métodos Exactos (para problemas pequeños/medianos)
*   **Programación Lineal Entera (ILP):** Formulación matemática resuelta por solvers optimizados como Gurobi o CPLEX.
*   **Branch-and-Bound / Branch-and-Cut:** Ramificación y acotación inteligente de soluciones.
*   **Relajación Lagrangiana:** Permite mover la restricción de recursos a la función objetivo con un penalizador, facilitando la obtención de cotas inferiores.

### 2. Heurísticas y Metaheurísticas (para problemas grandes)
Cuando las instancias tienen cientos o miles de ciudades, los métodos exactos tardan demasiado tiempo. Se emplean:
*   **Búsqueda Tabú (Tabu Search):** Explora el espacio de soluciones evitando caer en óptimos locales mediante una lista de movimientos prohibidos.
*   **Algoritmos Genéticos (GA):** Evolucionan una población de rutas a través de cruzamientos y mutaciones para encontrar la de menor costo factible.
*   **Recocido Simulado (Simulated Annealing):** Metaheurística basada en el enfriamiento físico de metales para escapar de óptimos locales.

---

## 📁 Estructura del Proyecto
*(La estructura se irá completando a medida que se implementen los algoritmos)*
```text
.
├── src/                  # Código fuente de las implementaciones
├── data/                 # Instancias de prueba del problema (.tsp, .txt)
├── docs/                 # Documentación adicional y reportes
├── README.md             # Información general del proyecto
└── .gitignore            # Archivos a ignorar en el repositorio
```
