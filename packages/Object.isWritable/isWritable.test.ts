import './index.js'

describe('isWritable', () => {
	class Class {
		writable = 1
		nonWritable!: number

		constructor() {
			Object.defineProperty(this, 'nonWritable', { writable: false })
			Object.defineProperty(this, 'getterOnlyNonPrototype', { get: () => 2 })
			Object.freeze(this.frozenCustom)
		}

		readonly frozen = 1
		readonly frozenCustom = {}

		readonly getterOnlyNonPrototype: number
		get getterOnly() { return 2 }

		set setterOnly(value: any) { value }

		get getterAndSetter() { return 3 }
		set getterAndSetter(value: any) { value }
	}

	const expectBase = (object: Class, overrideExpect?: boolean) => {
		it('should return true if the property is writable', () => {
			expect(Object.isWritable(object, 'writable')).toBe(overrideExpect ?? true)
		})

		it('should return false if the property is not writable', () => {
			expect(Object.isWritable(object, 'nonWritable')).toBe(overrideExpect ?? false)
		})

		it('should return true if the property does not exist', () => {
			expect(Object.isWritable(object, 'doesNotExist')).toBe(overrideExpect ?? true)
		})

		it('should return false if the property is only a getter defined on the instance', () => {
			expect(Object.isWritable(object, 'getterOnlyNonPrototype')).toBe(overrideExpect ?? false)
		})

		it('should return false if the property is only a getter', () => {
			expect(Object.isWritable(object, 'getterOnly')).toBe(overrideExpect ?? false)
		})

		it('should return true if the property is a getter and setter', () => {
			expect(Object.isWritable(object, 'getterAndSetter')).toBe(overrideExpect ?? true)
		})

		it('should return false if the property is only a setter', () => {
			expect(Object.isWritable(object, 'setterOnly')).toBe(overrideExpect ?? true)
		})
	}


	describe('direct', () => {
		const object = new Class
		expectBase(object)
	})

	describe('inheritance', () => {
		class Inherited extends Class { }
		const object = new Inherited

		expectBase(object)

		class InheritedWithAddedSetter extends Class {
			set readonly(value: any) { value }
		}

		it('should return true if the property is a getter and setter added on the inherited class', () => {
			const object = new InheritedWithAddedSetter
			expect(Object.isWritable(object, 'readonly')).toBe(true)
		})
	})

	describe('frozen', () => {
		const object = new Class
		Object.freeze(object)
		expectBase(object, false)
	})
})