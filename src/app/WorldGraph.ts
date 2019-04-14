// Directed graph representing stages and connections between stages
//
// edge = (target node, [ coordinates of crossing tiles ])

export class WorldGraph {
    adjacencyMap: Map<string, Map<string, [number, number][]>>;

    constructor() {
        this.adjacencyMap = new Map<string, Map<string, [number, number][]>>();
    }

    addVertex(name: string) {
        this.adjacencyMap.set(name, new Map<string, [number, number][]>());
    }

    addEdge(source: string, target: string, tiles: [number, number][]) {
        if(this.adjacencyMap.get(source).has(target)) {
            // edge already exists, you should be using modifyEdge
        }
        this.adjacencyMap.get(source).set(target, tiles);
    }

    // deleteNode(name: string) 

    deleteEdge(source: string, target: string) {
        this.adjacencyMap.get(source).delete(target);
    }

    deleteAllEdgesByVertex(source: string) {
        this.adjacencyMap.get(source).clear();
    }

    modifyEdge(source: string, target: string, tiles: [number, number][]) {
        this.adjacencyMap.get(source).set(target, tiles);
    }

    V(): number {
        return this.adjacencyMap.size;
    }

    E(): number {
        let n: number = 0;
        for(let vertex of this.adjacencyMap) {
            n += vertex[1].size;
        }

        return n;
    }

    // serialise()

}