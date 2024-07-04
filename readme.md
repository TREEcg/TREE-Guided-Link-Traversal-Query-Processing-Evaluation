# TREE-Guided-Link-Traversal-Query-Processing-Evaluation

## Dependencies
- [Nodejs 18 or higher](https://nodejs.org/en)
- [Rust](https://www.rust-lang.org/fr)

## Prepare the data

**Warning: Do not forget to clone the submodule**
### Clone the submodule 
```zsh
git submodule init 
git submodule update
```

or

```zsh
git clone --recurse-submodules -j8 {address of the repo}
```

### Generate fragments
```
./run_evaluation.sh install-comunica
yarn install
./run_evaluation.sh install-injestor
./run_evaluation.sh download-dataset 
./run_evaluation.sh dahcc-1-participant-one-ary-tree-100
```

## Queries

Q1
```sparql
PREFIX sosa: <http://www.w3.org/ns/sosa/> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX etsi: <https://saref.etsi.org/core/>
    
SELECT * WHERE {
    ?s etsi:hasTimestamp ?t.
?s etsi:hasValue ?result.
?s etsi:measurementMadeBy ?sensor.
?sensor <https://dahcc.idlab.ugent.be/Ontology/Sensors/analyseStateOf> ?stateOf.
?sensor <https://saref.etsi.org/core/measuresProperty> <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/energy.consumption>

    FILTER(?t="2022-01-03T10:57:54.000000"^^xsd:dateTime)
}
```

Q2
```sparql
PREFIX sosa: <http://www.w3.org/ns/sosa/> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX etsi: <https://saref.etsi.org/core/>
    
SELECT * WHERE {
    ?s etsi:hasTimestamp ?t.
?s etsi:hasValue ?result.
?s etsi:measurementMadeBy ?sensor.
?sensor <https://dahcc.idlab.ugent.be/Ontology/Sensors/analyseStateOf> ?stateOf.
?sensor <https://saref.etsi.org/core/measuresProperty> <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/environment.light>

    FILTER(?t="2022-01-03T19:54:22.469000"^^xsd:dateTime)
}
```

Q3
```sparql
PREFIX sosa: <http://www.w3.org/ns/sosa/> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX etsi: <https://saref.etsi.org/core/>
    
SELECT * WHERE {
    ?s etsi:hasTimestamp ?t.
?s etsi:hasValue ?result.
?s etsi:measurementMadeBy ?sensor.
?sensor <https://dahcc.idlab.ugent.be/Ontology/Sensors/analyseStateOf> ?stateOf.
?sensor <https://saref.etsi.org/core/measuresProperty> <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/energy.consumption>

    FILTER(?t>="2022-01-03T15:00:00.000000"^^xsd:dateTime && ?t<"2022-01-03T15:30:00.000000"^^xsd:dateTime)
}
```

Q4
```sparql
PREFIX sosa: <http://www.w3.org/ns/sosa/> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX etsi: <https://saref.etsi.org/core/>
    
SELECT * WHERE {
    ?s etsi:hasTimestamp ?t.
?s etsi:hasValue ?result.
?s etsi:measurementMadeBy ?sensor.
?sensor <https://dahcc.idlab.ugent.be/Ontology/Sensors/analyseStateOf> ?stateOf.
?sensor <https://saref.etsi.org/core/measuresProperty> <https://dahcc.idlab.ugent.be/Homelab/SensorsAndActuators/energy.consumption>

    FILTER((?t>="2022-01-03T15:00:00.000000"^^xsd:dateTime && ?t<"2022-01-03T20:00:00.000000"^^xsd:dateTime) && !(?t>="2022-01-03T15:10:00.000000"^^xsd:dateTime && ?t<"2022-01-03T15:40:00.000000"^^xsd:dateTime))
}
```

## Run the queries
To run the queries you have to run the following command schema.
```zsh
node comunica_runner.mjs -f ./evaluation/query/{}.ttl -m {TREE-GUIDED|TREE} -r http://localhost:8080/0.ttl -d http://localhost:8080/metadata.ttl  
```
For example

```zsh
node comunica_runner.mjs -f ./evaluation/query/Q2.ttl -m TREE-GUIDED -r http://localhost:8080/0.ttl -d http://localhost:8080/metadata.ttl  
```

It will output something like

```json
{"nResults":1,"timeExec":5111.714145,"nRequest":3}
```
