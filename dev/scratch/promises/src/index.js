// @flow

function run(fail: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fail) {
      console.log("run fail");
      reject(new Error("failed"));
    } else {
      console.log("run success");
      resolve();
    }
  });
}

function wrap(fail: boolean) {
  return run(fail)
    .then(() => {
      console.log("wrap success");
    })
    .catch((error: Error) => {
      console.log("wrap fail");
      throw error;
    });
}

wrap(false)
  .then(() => {
    console.log("success");
  })
  .catch((error: Error) => {
    console.log("fail");
  });
