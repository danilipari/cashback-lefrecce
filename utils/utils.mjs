import fs from 'fs';

class Utils {

  patch_env = (env = process.env, newEnvVars) => {
    let envFile = fs.readFileSync(`.env.${env.NODE_ENV}`, 'utf8');
    const envVars = {};
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      envVars[key] = value;
    });
    Object.assign(envVars, newEnvVars);
    let envString = '';
    for (const key in envVars) {
      if (envVars[key]) {
        envString += `${key}=${envVars[key]}\n`;
      }
    }
    fs.writeFileSync(`.env.${env.NODE_ENV}`, envString);

    return true;
  }

  parseImage = async (env, filename, redis$, callback) => {
    fs.readFile(`${env.INT_IMG_DIR}${filename}`, async (error, data) => {
      if (error) {
        await callback(error);
        return;
      }

      await redis$.set(`/images/${filename}`, data, {
        EX: this.secondsInHours(12),
        NX: true,
      }, (error, result) => {
        if (error)
          console.error('Error saving image:', error);
        // else
        //   console.log('Image saved to Redis cache');
      });
      await redis$.disconnect();

      await callback(null, data);
    });
  };

  htmlReplaceEnv = (env, data) => {
    let convertedData = data.toString();
    const ENVS = Object.keys(env);

    for (let key of ENVS) {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      convertedData = convertedData.replace(regex, process.env[key]);
    };
    return Buffer.from(convertedData, 'utf-8');
  }

  secondsInHours = (hours) => {
    const secondsInHour = 3600;
    const seconds = hours * secondsInHour;
    return seconds;
  }
}

export default Utils;