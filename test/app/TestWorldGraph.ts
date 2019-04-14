import { expect } from 'chai';
import { WorldGraph } from '../../src/app/WorldGraph';

describe('WorldGraph', function() {
    describe('Initialise', function() {
        let world = new WorldGraph();
        it('0 initial vertices', function() {
            expect(world.V()).equal(0);
        })

        it('0 initial edges', function() {
            expect(world.E()).equal(0);
        })

    })

    describe('One node graph', function() {
        let world = new WorldGraph();
        world.addVertex('stage1');
        it('1 vertex after adding', function() {
            expect(world.V()).to.equal(1);
        })
        
        it('Stage named "stage1" exists', function() {
            expect(world.adjacencyMap.has('stage1')).to.be.true;
        })

        it('stage1 has empty edges', function() {
            expect(world.adjacencyMap.get('stage1')).to.be.empty;
        })

    })

    describe('Two node graph with edge', function() {
        let world = new WorldGraph();
        world.addVertex('stage1');
        world.addVertex('stage2');
        let tiles: [number, number][] = [
            [0, 0], [0, 1], [0, 2]
        ];

        it('1 edge after adding edge', function() {
            world.addEdge('stage1', 'stage2', tiles);

            expect(world.E()).to.equal(1);
        })

        it('1 edge from stage1 to stage2', function() {
            world.addEdge('stage1', 'stage2', tiles);
            expect(world.adjacencyMap.get('stage1').has('stage2')).to.be.true;
        })

        it('3 tiles in edge crossing', function() {
            world.addEdge('stage1', 'stage2', tiles);
            let crossing = world.adjacencyMap.get('stage1').get('stage2');
            expect(crossing.length).to.equal(3);
            expect(crossing[0]).to.equal(tiles[0]);
            expect(crossing[1]).to.equal(tiles[1]);
            expect(crossing[2]).to.equal(tiles[2]);
        })
    })

    describe('Three node graph with two edges', function() {
        let world = new WorldGraph();
        world.addVertex('stage1');
        world.addVertex('stage2');
        world.addVertex('stage3');

        let tiles1: [number, number][] = [
            [0, 1], [0, 2], [0, 3]
        ];

        let tiles2: [number, number][] = [
            [7, 1], [7, 2], [7, 3]
        ];
        
        it('2 edges from stage2', function() {
            world.addEdge('stage2', 'stage1', tiles1);
            world.addEdge('stage2', 'stage3', tiles2);
    
            expect(world.adjacencyMap.get('stage2').size).to.equal(2);
        })

        it('1 edge from stage1 after delete', function() {
            world.addEdge('stage2', 'stage1', tiles1);
            world.addEdge('stage2', 'stage3', tiles2);
            world.deleteEdge('stage2', 'stage1');

            expect(world.adjacencyMap.get('stage2').size).to.equal(1);
        })
        it('remaining edge is to stage3', function() {
            world.addEdge('stage2', 'stage1', tiles1);
            world.addEdge('stage2', 'stage3', tiles2);
            world.deleteEdge('stage2', 'stage1');

            expect(world.adjacencyMap.get('stage2').has('stage3')).to.be.true;
        })
    })

    describe('Modify edge', function() {
        let world = new WorldGraph();
        world.addVertex('stage1');
        world.addVertex('stage2');
        let tiles1: [number, number][] = [
            [0, 1], [0, 2], [0, 3]
        ];

        let tiles2: [number, number][] = [
            [0, 2], [0, 3], [0, 4]
        ];
        it('change crossing tiles', function() {
            world.addEdge('stage1', 'stage2', tiles1);
            world.modifyEdge('stage1', 'stage2', tiles2);

            let crossing = world.adjacencyMap.get('stage1').get('stage2');
            expect(crossing.length).to.equal(3);
            expect(crossing[0]).to.equal(tiles2[0]);
            expect(crossing[1]).to.equal(tiles2[1]);
            expect(crossing[2]).to.equal(tiles2[2]);
        })
    })
    
    
})

