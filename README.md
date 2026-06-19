# RCTVRP: Risk-constrained Cash-in-Transit Vehicle Routing Problem
Este repositorio contiene la implementación y análisis para el problema **RCTVRP (Risk-constrained Cash-in-Transit Vehicle Routing Problem)**, desarrollado como parte del curso de **Optimización (OPT)** del **Semestre 7**.

## 👥 Integrantes
*   **Matias Santos**
*   **Jose Romero**
*   **David Cortez**

--------------------------------------------------------------------------------

## Introducción al Problema
### ¿Qué es el VRP (Vehicle Routing Problem)?
El **Problema de Ruteo de Vehículos (VRP)** es un nombre genérico para una clase de problemas que consisten en diseñar rutas óptimas para una flota de vehículos que debe visitar a un conjunto de clientes dispersos geográficamente desde uno o más depósitos.
*   **Por qué importa:** Es fundamental para determinar estrategias eficientes que reduzcan costos operacionales en redes de distribución. Está clasificado como **NP-duro**, lo que dificulta su resolución exacta para conjuntos de datos grandes en tiempos aceptables.
*   **Dónde aparece:** Gestión de cadenas de suministro, recolección de residuos, transporte de materiales peligrosos y distribución de mercancías en general.

--------------------------------------------------------------------------------

### ¿Qué es el RCTVRP (Risk-constrained Cash-in-Transit VRP)?
El **Risk-constrained Cash-in-Transit VRP (RCTVRP)** es una variante especializada del VRP diseñada para la industria del transporte de valores (efectivo, joyas, bienes valiosos). En este problema, la seguridad es el aspecto crítico y se trata como el principal factor limitante en lugar de la capacidad física del vehículo.

En el RCTVRP:
1. El riesgo asociado a un robo se asume **proporcional a la cantidad de efectivo transportado** y a la **distancia o tiempo recorrido** por el vehículo.
2. El objetivo es definir un conjunto de rutas que **minimicen la distancia total recorrida**, asegurando que cada cliente sea visitado exactamente una vez.
3. Se impone una **restricción de riesgo estricta**: el riesgo global acumulado en cada ruta no debe exceder un umbral de riesgo predefinido ($T$).

#### Formulación de Riesgo Acumulado
El índice de riesgo $R_j^r$ para un nodo $j$ en una ruta $r$ se calcula de forma recursiva basándose en la carga acumulada:
$$R_j^r = R_i^r + P_i^r \cdot d_{ij}$$
Donde $P_i^r$ es el efectivo a bordo tras visitar el nodo $i$ y $d_{ij}$ es la distancia del arco. Debido a que la carga aumenta tras cada recogida, el riesgo es acumulativo y **no simétrico**.

#### Diferencias Clave
| Característica | VRP Tradicional | RCTVRP (Risk-constrained) |
| :--- | :--- | :--- |
| **Objetivo** | Minimizar costo o distancia total. | Minimizar costo manteniendo la seguridad. |
| **Restricción Principal** | Capacidad física de carga del vehículo ($Q$). | Umbral de riesgo máximo permitido ($T$). |
| **Simetría** | Generalmente simétrico (costo $i \to j$ igual a $j \to i$). | **No simétrico**: el riesgo cambia según el orden de visita debido a la carga acumulada. |
| **Dificultad de Factibilidad** | Encontrar una solución factible es relativamente simple. | Es complejo, ya que una ruta puede ser factible en un sentido pero exceder el riesgo en el inverso. |

--------------------------------------------------------------------------------

## Aplicaciones del RCTVRP
*   **Sector Bancario y ATMs:** Distribución y recolección de billetes y monedas entre bancos centrales y cajeros automáticos.
*   **Gran Comercio (Retail):** Recolección de ingresos diarios en centros comerciales, joyerías, casinos y grandes tiendas minoristas.
*   **Transporte de Materiales Críticos:** Aunque enfocado en efectivo, el modelo es aplicable a la recogida de sustancias peligrosas o químicos valiosos donde el tiempo de exposición aumenta el peligro de un incidente.

--------------------------------------------------------------------------------

## Métodos de Resolución
Dado que el RCTVRP es un problema combinatorio complejo, se utilizan diversos enfoques:
### 1. Métodos Exactos (Instancias pequeñas)
*   **Programación Lineal Entera Mixta (MILP):** Resolviendo formulaciones matemáticas que utilizan variables de decisión binarias para representar el flujo en los arcos y variables continuas para el riesgo acumulado.

### 2. Metaheurísticas (Instancias grandes)
*   **LKH-3:** Uno de los mejores resolvedores heurísticos actuales. Transforma el problema en un TSP simétrico estándar usando **funciones de penalización** para manejar el riesgo, priorizando la factibilidad de la ruta antes de optimizar su costo.
*   **aLNS (Ant colony heuristic with Large Neighbourhood Search):** Un algoritmo que combina la optimización de colonias de hormigas con búsqueda local iterada, logrando superar consistentemente a enfoques previos.
*   **Fuzzy GRASP:** Enfoques que incorporan lógica difusa para modelar la incertidumbre del riesgo de manera más realista, permitiendo diferenciar entre rutas según su grado de seguridad.
