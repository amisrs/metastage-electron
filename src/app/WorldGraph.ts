import { Stage } from '../app/Stage';
// Directed graph representing stages and connections between stages
//
// edge = (target node, [ coordinates of crossing tiles ])

export class WorldGraph {
    // adjacencyMap: Map<string, StageInfo>;
    adjacencyMap;

    constructor() {
        // this.adjacencyMap = new Map<string, StageInfo>();
        this.adjacencyMap = {};
    }

    addVertex(stage: Stage) {
        // this.adjacencyMap.set(stage.name, new StageInfo(stage.x, stage.y));
        this.adjacencyMap[stage.name] = new StageInfo(stage.x, stage.y);
    }

    addEdge(source: Stage, target: Stage, tiles: [number, number][]) {
        if(this.adjacencyMap[source.name].adjacents[target.name]) {
            // edge already exists, you should be using modifyEdge
        }
        this.adjacencyMap[source.name].adjacents[target.name] = tiles;
    }

    // deleteNode(name: string) 

    deleteEdge(source: Stage, target: Stage) {
        delete this.adjacencyMap[source.name].adjacents[target.name];
    }

    deleteAllEdgesByVertex(source: Stage) {
        this.adjacencyMap[source.name].adjacents = {};
    }

    modifyEdge(source: Stage, target: Stage, tiles: [number, number][]) {
        this.adjacencyMap[source.name].adjacents[target.name] = tiles;
    }

    updateStageInfo(stage: Stage) {
        let toUpdate: StageInfo = this.adjacencyMap[stage.name];
        toUpdate.x = stage.x;
        toUpdate.y = stage.y;
    }

    V(): number {
        return this.adjacencyMap.size;
    }

    E(): number {
        let n: number = 0;
        for(let vertex of this.adjacencyMap) {
            n += this.adjacencyMap[vertex].adjacents.size;
        }

        return n;
    }

    serialise(): string {
        let json: string = JSON.stringify(this.adjacencyMap, null, 2);
        console.log(json);
        return json;        
    }
 
}

class StageInfo {
    x: number;
    y: number;

    // adjacents: Map<string, [number, number][]>;
    adjacents;

    constructor(x: number = 0, y: number = 0) {
        this.x = 0;
        this.y = 0
        // this.adjacents = new Map<string, [number, number][]>();
        this.adjacents = {};
    }
}