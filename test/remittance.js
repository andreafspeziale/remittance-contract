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

    const puzzle = web3.sha3(pwd1, pwd2)
    const wrongPuzzle = web3.sha3(pwd1, pwd3)

    const bal = web3.eth.getBalance(owner)

    const expectEvent = (res, eventName) => {
        const ev = _.find(res.logs, {event: eventName})
        expect(ev).to.not.be.undefined
        return ev
    }

    beforeEach(async() => {
        contract = await Remittance.new(puzzle, exchange, 10, {value: web3.toWei(4, 'ether')})
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

        it("should set back the owner", async () => {
            const transferOwnership = await contract.transferOwnership(owner)
            const newOwner = await contract.owner()
            assert.strictEqual(newOwner, owner, "Contract owner has not been updated")
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

        it('should not kill the contract if timeframe has not expired', async () => {
            try {
                const isKilled = await contract.kill()
                assert.isUndefined(isKilled, 'Anyone can kill the contract')
            } catch(e) {
                assert.include(e.message, 'revert', 'No revert if owner kill the contract while is not expired')
            }
        })

        it('should kill the contract if timeframe has expired and the fuction is invoke by the owner', async () => {
            const cont = await Remittance.new(puzzle, exchange, 0, {from: thirdy, value: web3.toWei(4, 'ether')})
            const isKilled = await cont.kill({from: thirdy})
            const status = isKilled.receipt.status
            assert.equal(status, '0x01', "Contract is not dead")
        })

        it('should not kill the contract even if timeframe has expired', async () => {
            try {
                const cont = await Remittance.new(puzzle, exchange, 0, {from: thirdy, value: web3.toWei(4, 'ether')})
                const isKilled = await cont.kill({from: owner})
            } catch(e) {
                assert.include(e.message, 'revert', 'No revert if owner kill the contract while is not expired')
            }
        })
    })

    describe("Redeem stuff:", async () => {

        it('should not reedem since timeframe is not expired', async () => {
            try {
                const redeem = await contract.redeem()
            } catch(e) {
                assert.include(e.message, 'revert', 'Can be redeem whenever')
            }
        })

        it('should not reedem if invoke by no owner', async () => {
            try {
                const cont = await Remittance.new(puzzle, exchange, 0, {value: web3.toWei(4, 'ether')})
                const redeem = await cont.redeem({from: thirdy})
            } catch(e) {
                assert.include(e.message, 'revert', 'Anyone can reedem')
            }
        })

        it('should reedem 4 ether', async () => {
            const cont = await Remittance.new(puzzle, exchange, 0, {value: web3.toWei(4, 'ether')})
            const initial = Math.trunc(web3.fromWei(web3.eth.getBalance(owner), 'ether'))
            const redeem = await cont.redeem()
            const final = Math.trunc(web3.fromWei(web3.eth.getBalance(owner), 'ether'))
            assert.equal(final-initial, 4, 'Reedem failed')
        })

        it("should log an LogRedeem event", async () => {
            const cont = await Remittance.new(puzzle, exchange, 0, {from: thirdy, value: web3.toWei(4, 'ether')})
            const redeem = await cont.redeem({from: thirdy})
            const ev = expectEvent(redeem, 'LogRedeem')
            expect(ev.args.from).to.equal(thirdy)
            expect(ev.args.amount.toString(10)).to.equal(web3.toWei(4, 'ether'))
        })
    })

    describe("Withdraw stuff:", async () => {

        it('should not withdraw from an unknown address', async () => {
            try {
                const withdraw = await contract.withdraw(pwd1, pwd2, {from: thirdy})
            } catch(e) {
                assert.include(e.message, 'revert', 'Can withdraw anyone')
            }
        })

        it('should not withdraw because timeframe is expired', async () => {
            try {
                const cont = await Remittance.new(puzzle, exchange, 0, {from: thirdy, value: web3.toWei(1, 'ether')})
                const withdraw = await cont.withdraw(pwd1, pwd2, {from: exchange})
            } catch(e) {
                assert.include(e.message, 'revert', 'Can withdraw whenever')
            }
        })

        it('should not withdraw because because of passwords', async () => {
            try {
                const withdraw = await contract.withdraw(pwd1, pwd3, {from: exchange})
            } catch(e) {
                assert.include(e.message, 'revert', 'Can withdraw with any password')
            }
        })

        it('should withdraw', async () => {
            const initial = Math.trunc(web3.fromWei(web3.eth.getBalance(exchange), 'ether'))
            const withdraw = await contract.withdraw(pwd1, pwd2, {from: exchange})
            const final = Math.trunc(web3.fromWei(web3.eth.getBalance(exchange), 'ether'))
            assert.equal(final-initial, 4, 'withdraw failed')
        })
    })
})