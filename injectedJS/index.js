import initializers from "./initializers"
import watchers from "./watchers";

try {
    initializers();
    watchers();
} catch (e) {
    console.log('------------------');
    console.log(e.toString());
    console.log('------------------');
}