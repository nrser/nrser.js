class A {
  
}

class B extends A {
  
}

class C extends B {
  
}

const c = new C();

console.log(c instanceof A);
