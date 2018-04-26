const Remittance = artifacts.require("./Remittance.sol")
const _ = require('lodash')

contract('Remittance', (accounts)=> {
    let contract
    const owner = accounts[0]
    const exchange = accounts[1]
    const thirdy = accounts[2]
    const pwd1 = 'hello1'
    const pwd2 = 'hello2'
    const pwd3 = 'hello3'

    const expectEvent = (res, eventName) => {
        const ev = _.find(res.logs, {event: eventName})
        expect(ev).to.not.be.undefined
        return ev
    }

    beforeEach(async() => {
        contract = await Remittance.new(pwd1, pwd2, exchange, 10, {value: web3.toWei(4, 'ether')})      
    })

    describe("Ownership stuff:", () => {
        it("should be own by owner", async () => {
            const owner = await contract.owner()
            assert.strictEqual(owner, owner, "Contract owner is not the same")
        })
        it("should set a new owner", async () => {
            const transferOwnership = await contract.transferOwnership(thirdy)
            const newOwner = await contract.owner()
            assert.strictEqual(newOwner, thirdy, "Contract owner has not been updated")
        })

        it("should log an LogOwnershipTransferred event", async () => {
            const transferOwnership = await contract.transferOwnership(thirdy)
            const newOwner = await contract.owner()
            const ev = expectEvent(transferOwnership, 'LogOwnershipTransferred')
            expect(ev.args.previousOwner).to.equal(owner)
            expect(ev.args.newOwner).to.equal(thirdy)
        })
    })
    describe("Kill stuff:", async () => {
        it('should fail on no owner invokation', async () => {
            try{
                const isKilled = await contract.kill({from: thirdy})
                assert.isUndefined(isKilled, 'Anyone can kill the contract')
            } catch (e) {
                assert.include(e.message, 'revert', 'No revert if anyone kill the contract')
            }
        })
        // it('should kill the contract on owner invokation', async () => {
        //     try {
        //         await contract.kill()
        //         const owner = await contract.owner()
        //         console.log(owner)
        //         assert.equal(owner, '0x0', 'The contract is not killed')
        //     } catch(e) {
        //         //const ow = await contract.owner()
        //         //console.log('error', ow)
        //         console.log('error', contract.exchange())
        //     }
        // })
    })
})