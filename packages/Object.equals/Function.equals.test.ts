import './index.js'
import { equals } from './index.js'

describe('Function.prototype[equals]', () => {
	describe('function declarations', () => {
		function a() { return 1 }
		function b() { return 1 }
		function c() { return 2 }

		it('should return true for the same function', () => {
			expect(a[equals](a)).toBe(true)
			expect(c[equals](c)).toBe(true)
		})

		it('should return false when comparing to non-functions', () => {
			expect(a[equals](null!)).toBe(false)
			expect(a[equals]({} as any)).toBe(false)
			expect(a[equals]([] as any)).toBe(false)
			expect(a[equals](1 as any)).toBe(false)
			expect(a[equals]('function a() { return 1 }' as any)).toBe(false)
		})

		it('should return false for equal function bodies but different function names', () => {
			expect(a[equals](b)).toBe(false)
		})

		it('should return false for different functions', () => {
			expect(a[equals](b)).toBe(false)
			expect(a[equals](c)).toBe(false)
		})
	})

	describe('function expressions', () => {
		const a1 = function () { return 1 }
		const a2 = function () { return 1 }
		const b = function () { return 2 }
		const c1 = function (x = 1) { return x }
		const c2 = function (x = 2) { return x }

		it('should return true for identical functions', () => {
			expect(a1[equals](a1)).toBe(true)
			expect(b[equals](b)).toBe(true)
		})

		it('should return true for equal functions', () => {
			expect(a1[equals](a2)).toBe(true)
		})

		it('should return false when comparing to non-functions', () => {
			expect(a1[equals](null!)).toBe(false)
			expect(a1[equals]({} as any)).toBe(false)
			expect(a1[equals]([] as any)).toBe(false)
			expect(a1[equals](1 as any)).toBe(false)
			expect(a1[equals]('function a() { return 1 }' as any)).toBe(false)
		})

		it('should return false for different return values', () => {
			expect(a1[equals](b)).toBe(false)
		})

		it('should return false for different default parameters', () => {
			expect(c1[equals](c2)).toBe(false)
		})
	})

	describe('arrow functions', () => {
		const a1 = () => 1
		const a2 = () => 1
		const b = () => 2
		const c1 = (x = 1) => x
		const c2 = (x = 2) => x

		it('should return true for identical functions', () => {
			expect(a1[equals](a1)).toBe(true)
			expect(b[equals](b)).toBe(true)
		})

		it('should return true for equal functions', () => {
			expect(a1[equals](a2)).toBe(true)
		})

		it('should return false when comparing to non-functions', () => {
			expect(a1[equals](null!)).toBe(false)
			expect(a1[equals]({} as any)).toBe(false)
			expect(a1[equals]([] as any)).toBe(false)
			expect(a1[equals](1 as any)).toBe(false)
			expect(a1[equals]('function a() { return 1 }' as any)).toBe(false)
		})

		it('should return false for different return values', () => {
			expect(a1[equals](b)).toBe(false)
		})

		it('should return false for different default parameters', () => {
			expect(c1[equals](c2)).toBe(false)
		})
	})
})